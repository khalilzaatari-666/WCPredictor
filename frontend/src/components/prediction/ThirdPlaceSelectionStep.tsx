'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, CheckCircle } from 'lucide-react';
import { COUNTRY_FLAGS } from '@/data/worldcup2026';

interface Props {
  thirdPlaceTeams: { team: string; group: string }[];
  selectedTeams: string[];
  onSelectionChange: (teams: string[]) => void;
}

export default function ThirdPlaceSelectionStep({ thirdPlaceTeams, selectedTeams, onSelectionChange }: Props) {
  const [localSelection, setLocalSelection] = useState<string[]>(selectedTeams);

  useEffect(() => {
    setLocalSelection(selectedTeams);
  }, [selectedTeams]);

  // Disable scrolling when component mounts
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleToggleTeam = (team: string) => {
    let newSelection: string[];

    if (localSelection.includes(team)) {
      // Deselect team
      newSelection = localSelection.filter(t => t !== team);
    } else {
      // Select team (only if less than 8 selected)
      if (localSelection.length < 8) {
        newSelection = [...localSelection, team];
      } else {
        return; // Already 8 teams selected
      }
    }

    setLocalSelection(newSelection);
    onSelectionChange(newSelection);
  };

  const isTeamSelected = (team: string) => localSelection.includes(team);
  const selectionComplete = localSelection.length === 8;

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-wc-gold" />
            <div>
              <h2 className="text-3xl font-bold">Select Best 8 Third Place Teams</h2>
              <p className="text-muted-foreground">
                Choose 8 teams from the third-place finishers to qualify for the knockout stage
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${selectionComplete ? 'text-green-500' : 'text-wc-gold'}`}>
              {localSelection.length}/8
            </div>
            <div className="text-sm text-muted-foreground">Teams Selected</div>
          </div>
        </div>
      </motion.div>

      {/* Third Place Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 mb-6">
        {thirdPlaceTeams.map((item, index) => (
          <ThirdPlaceTeamCard
            key={item.team}
            team={item.team}
            group={item.group}
            isSelected={isTeamSelected(item.team)}
            canSelect={localSelection.length < 8 || isTeamSelected(item.team)}
            onToggle={() => handleToggleTeam(item.team)}
            index={index}
          />
        ))}
      </div>

      {selectionComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-3"
        >
          <CheckCircle className="w-6 h-6 text-green-500" />
          <span className="text-green-500 font-medium">
            Selection complete! Click Next to continue to the knockout stage.
          </span>
        </motion.div>
      )}

      {!selectionComplete && (
        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
          <p className="text-blue-200">
            <strong>Note:</strong> Select {8 - localSelection.length} more team{8 - localSelection.length !== 1 ? 's' : ''} to proceed.
          </p>
        </div>
      )}
    </div>
  );
}

function ThirdPlaceTeamCard({
  team,
  group,
  isSelected,
  canSelect,
  onToggle,
  index,
}: {
  team: string;
  group: string;
  isSelected: boolean;
  canSelect: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={canSelect ? { scale: 1.02 } : {}}
      whileTap={canSelect ? { scale: 0.98 } : {}}
      onClick={onToggle}
      disabled={!canSelect && !isSelected}
      className={`relative p-3 rounded-xl border-2 transition-all backdrop-blur-sm flex flex-col items-center justify-center aspect-square w-full ${
        isSelected
          ? 'border-green-500 bg-green-500/20 shadow-lg shadow-green-500/20'
          : canSelect
          ? 'border-yellow-500/50 bg-yellow-500/10 hover:bg-yellow-500/20 hover:border-yellow-500'
          : 'border-white/10 bg-white/5 opacity-50 cursor-not-allowed'
      }`}
    >
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-1 right-1"
        >
          <CheckCircle className="w-5 h-5 text-green-500 fill-green-500/20" />
        </motion.div>
      )}

      <div className="flex flex-col items-center gap-2 w-full">
        <span className="text-4xl">{COUNTRY_FLAGS[team] || '🏳️'}</span>
        <div className="text-center w-full">
          <div className={`font-bold text-sm ${isSelected ? 'text-green-500' : ''} truncate`}>
            {team}
          </div>
          <div className="text-xs text-muted-foreground mt-1 truncate">
            Group {group} - 3rd Place
          </div>
        </div>
      </div>

      {isSelected && (
        <div className="mt-3 text-xs text-green-500 font-medium text-center">
          ✓ Qualified for Round of 32
        </div>
      )}
    </motion.button>
  );
}
