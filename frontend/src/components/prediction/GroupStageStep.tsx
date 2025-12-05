'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import { COUNTRY_FLAGS } from '@/data/worldcup2026';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
  group: string;
  teams: string[];
  standings: string[];
  onStandingsChange: (standings: string[]) => void;
}

function SortableTeam({ team, position }: { team: string; position: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: team });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPositionColor = (pos: number) => {
    if (pos === 0 || pos === 1) return 'border-green-500 bg-green-500/10';
    if (pos === 2) return 'border-yellow-500 bg-yellow-500/10';
    return 'border-white/10 bg-white/5';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 rounded-xl border-2 ${getPositionColor(position)} backdrop-blur-sm mb-3 cursor-move hover:scale-102 transition-all`}
    >
      <div className="flex items-center gap-4">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex-1 flex items-center gap-3">
          <span className="text-4xl">{COUNTRY_FLAGS[team] || '🏳️'}</span>
          <div>
            <div className="font-bold text-lg">{team}</div>
            <div className="text-sm text-muted-foreground">
              {position === 0 && '1st - Qualified'}
              {position === 1 && '2nd - Qualified'}
              {position === 2 && '3rd - Possible Qualification'}
              {position === 3 && '4th - Eliminated'}
            </div>
          </div>
        </div>
        <div className="text-3xl font-bold text-wc-gold">{position + 1}</div>
      </div>
    </div>
  );
}

export default function GroupStageStep({ group, teams, standings, onStandingsChange }: Props) {
  const [localStandings, setLocalStandings] = useState<string[]>(standings.length ? standings : teams);

  useEffect(() => {
    if (standings.length) {
      setLocalStandings(standings);
    }
  }, [standings]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localStandings.indexOf(active.id as string);
      const newIndex = localStandings.indexOf(over.id as string);
      const newStandings = arrayMove(localStandings, oldIndex, newIndex);
      setLocalStandings(newStandings);
      onStandingsChange(newStandings);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <h2 className="text-3xl font-bold mb-2">Group {group}</h2>
        <p className="text-muted-foreground mb-6">
          Drag and drop to rank teams from 1st to 4th place
        </p>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={localStandings} strategy={verticalListSortingStrategy}>
            {localStandings.map((team, index) => (
              <SortableTeam key={team} team={team} position={index} />
            ))}
          </SortableContext>
        </DndContext>

        <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p className="text-sm text-blue-200">
            <strong>Note:</strong> Top 2 teams qualify directly. 3rd place teams may qualify based on performance.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
