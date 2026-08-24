import React, { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  closestCorners,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Board, Column, Task } from '../types/kanban';
import { ColumnContainer } from './ColumnContainer';
import { TaskCard } from './TaskCard';

interface KanbanBoardProps {
  board: Board;
  searchQuery: string;
  selectedAssigneeFilter: string;
  onAddTask: (columnId: string) => void;
  onEditColumn: (column: Column) => void;
  onDeleteColumn: (columnId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onReorderColumns: (newColumns: Column[]) => void;
  onMoveTasks: (boardId: string, updatedTasks: { id: string; columnId: string; order: number }[]) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  board,
  searchQuery,
  selectedAssigneeFilter,
  onAddTask,
  onEditColumn,
  onDeleteColumn,
  onEditTask,
  onDeleteTask,
  onReorderColumns,
  onMoveTasks,
}) => {
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columnIds = useMemo(() => board.columns.map((c) => c.id), [board.columns]);

  // Filtrar tareas según la búsqueda de texto y el responsable seleccionado
  const filteredColumns = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return board.columns.map((col) => ({
      ...col,
      tasks: col.tasks.filter((t) => {
        // Filtro de texto
        const matchesText =
          !q ||
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.assignedToUser?.name.toLowerCase().includes(q);

        // Filtro de responsable
        let matchesAssignee = true;
        if (selectedAssigneeFilter === 'UNASSIGNED') {
          matchesAssignee = !t.assignedToId;
        } else if (selectedAssigneeFilter !== 'ALL') {
          matchesAssignee = t.assignedToId === selectedAssigneeFilter;
        }

        return matchesText && matchesAssignee;
      }),
    }));
  }, [board.columns, searchQuery, selectedAssigneeFilter]);

  const handleDragStart = (event: DragStartEvent) => {
    const { current } = event.active.data;
    if (current?.type === 'Column') {
      setActiveColumn(current.column);
      return;
    }
    if (current?.type === 'Task') {
      setActiveTask(current.task);
      return;
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    // Arrastrar tarea sobre otra tarea
    if (isActiveTask && isOverTask) {
      const activeTaskItem = active.data.current?.task as Task;
      const overTaskItem = over.data.current?.task as Task;

      if (activeTaskItem && overTaskItem && activeTaskItem.columnId !== overTaskItem.columnId) {
        const sourceCol = board.columns.find((c) => c.id === activeTaskItem.columnId);
        const destCol = board.columns.find((c) => c.id === overTaskItem.columnId);

        if (sourceCol && destCol) {
          const updatedColumns = board.columns.map((col) => {
            if (col.id === sourceCol.id) {
              return { ...col, tasks: col.tasks.filter((t) => t.id !== activeTaskItem.id) };
            }
            if (col.id === destCol.id) {
              const taskIndex = col.tasks.findIndex((t) => t.id === overTaskItem.id);
              const newTasks = [...col.tasks];
              newTasks.splice(taskIndex, 0, { ...activeTaskItem, columnId: destCol.id });
              return { ...col, tasks: newTasks };
            }
            return col;
          });
          onReorderColumns(updatedColumns);
        }
      }
    }

    // Arrastrar tarea a una columna vacía
    if (isActiveTask && isOverColumn) {
      const activeTaskItem = active.data.current?.task as Task;
      const overColumnItem = over.data.current?.column as Column;

      if (activeTaskItem && overColumnItem && activeTaskItem.columnId !== overColumnItem.id) {
        const updatedColumns = board.columns.map((col) => {
          if (col.id === activeTaskItem.columnId) {
            return { ...col, tasks: col.tasks.filter((t) => t.id !== activeTaskItem.id) };
          }
          if (col.id === overColumnItem.id) {
            return { ...col, tasks: [...col.tasks, { ...activeTaskItem, columnId: overColumnItem.id }] };
          }
          return col;
        });
        onReorderColumns(updatedColumns);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Arrastre de columnas
    if (active.data.current?.type === 'Column') {
      if (activeId !== overId) {
        const oldIndex = board.columns.findIndex((c) => c.id === activeId);
        const newIndex = board.columns.findIndex((c) => c.id === overId);
        const reordered = arrayMove(board.columns, oldIndex, newIndex).map((col, idx) => ({
          ...col,
          order: idx,
        }));
        onReorderColumns(reordered);
      }
      return;
    }

    // Arrastre de tareas final
    if (active.data.current?.type === 'Task') {
      const taskListUpdates: { id: string; columnId: string; order: number }[] = [];
      board.columns.forEach((col) => {
        col.tasks.forEach((t, idx) => {
          taskListUpdates.push({ id: t.id, columnId: col.id, order: idx });
        });
      });
      onMoveTasks(board.id, taskListUpdates);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-12 overflow-x-auto">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex items-start gap-6 min-h-[650px] pb-6">
          <SortableContext items={columnIds}>
            {filteredColumns.map((column) => (
              <ColumnContainer
                key={column.id}
                column={column}
                tasks={column.tasks}
                onAddTask={onAddTask}
                onEditColumn={onEditColumn}
                onDeleteColumn={onDeleteColumn}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
              />
            ))}
          </SortableContext>
        </div>

        <DragOverlay>
          {activeColumn && (
            <ColumnContainer
              column={activeColumn}
              tasks={activeColumn.tasks}
              onAddTask={() => {}}
              onEditColumn={() => {}}
              onDeleteColumn={() => {}}
              onEditTask={() => {}}
              onDeleteTask={() => {}}
              isOverlay
            />
          )}

          {activeTask && (
            <TaskCard
              task={activeTask}
              onEdit={() => {}}
              onDelete={() => {}}
              isOverlay
            />
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
