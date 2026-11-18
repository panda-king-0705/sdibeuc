import { useState } from 'react';
import type { Contract } from '@sdibeuc/engine';
import { scoreContract } from '@sdibeuc/engine';
import { STRAIN_SYMBOL, strainColor } from '../ui';

export function ScorePanel({
  contract, declarerVulnerable,
}: {
  contract: Contract;
  declarerVulnerable: boolean;
}) {
  const needed = contract.level + 6;
  const [tricks, setTricks] = useState(needed);
  const result = scoreContract({ contract, tricksWon: tricks, vulnerable: declarerVulnerable });

  const dblLabel = contract.doubled === 'doubled' ? ' ✕' : contract.doubled === 'redoubled' ? ' ✕✕' : '';

  return (
    <div className="score">
      <div className="score__contract">
        <span className="score__level">{contract.level}</span>
        <span style={{ color: strainColor(contract.strain) }}>{STRAIN_SYMBOL[contract.strain]}</span>
        <span className="score__dbl">{dblLabel}</span>
        <span className="score__by">by {contract.declarer}</span>
        <span className={`score__vul ${declarerVulnerable ? 'is-vul' : ''}`}>
          {declarerVulnerable ? 'Vulnerable' : 'Not vulnerable'}
        </span>
      </div>

      <label className="score__tricks">
        Tricks won by declarer: <strong>{tricks}</strong>
        <input
          type="range"
          min={0}
          max={13}
          value={tricks}
          onChange={(e) => setTricks(Number(e.target.value))}
        />
        <span className="score__need">need {needed}</span>
      </label>

      <div className={`score__result ${result.made ? 'made' : 'set'}`}>
        <span className="score__points">
          {result.declarerScore >= 0 ? `+${result.declarerScore}` : result.declarerScore}
        </span>
        <span className="score__verdict">
          {result.made
            ? result.overtricks > 0
              ? `Made +${result.overtricks}`
              : 'Made exactly'
            : `Down ${result.undertricks}`}
        </span>
      </div>

      {result.made && (
        <ul className="score__breakdown">
          {Object.entries(result.breakdown)
            .filter(([, v]) => v !== 0)
            .map(([k, v]) => (
              <li key={k}><span>{labelFor(k)}</span><span>{v}</span></li>
            ))}
        </ul>
      )}
    </div>
  );
}

function labelFor(key: string): string {
  switch (key) {
    case 'trickPoints': return 'Trick points';
    case 'overtrickPoints': return 'Overtricks';
    case 'gameOrPartscore': return 'Game / part-score';
    case 'slamBonus': return 'Slam bonus';
    case 'insult': return 'Double bonus';
    default: return key;
  }
}
