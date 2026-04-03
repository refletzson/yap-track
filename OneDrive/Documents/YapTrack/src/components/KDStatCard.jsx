import { motion } from 'framer-motion'
import { FiTarget, FiShield, FiTrendingUp } from 'react-icons/fi'

export default function KDStatCard({ kills, deaths, ratio }) {
  const displayRatio = ratio === null ? '—' : ratio === 'perfect' ? '∞' : ratio

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface border border-border rounded-2xl p-6 mb-6"
    >
      <h2 className="text-sm font-bold uppercase tracking-widest text-muted mb-4">Your K/D Stats</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <FiTarget className="text-accent" size={16} />
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Kills</span>
          </div>
          <div className="text-4xl font-black text-accent">{kills}</div>
          <div className="text-xs text-muted mt-1">confirmed calls</div>
        </div>

        <div className="text-center border-x border-border">
          <div className="flex items-center justify-center gap-2 mb-1">
            <FiShield className="text-denied" size={16} />
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Deaths</span>
          </div>
          <div className="text-4xl font-black text-denied">{deaths}</div>
          <div className="text-xs text-muted mt-1">called on you</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <FiTrendingUp className="text-hit" size={16} />
            <span className="text-xs font-bold uppercase tracking-wider text-muted">K/D</span>
          </div>
          <div className={`text-4xl font-black ${ratio === 'perfect' ? 'text-accent' : 'text-hit'}`}>
            {displayRatio}
          </div>
          {ratio === 'perfect' && (
            <div className="text-xs text-accent mt-1 font-bold">PERFECT</div>
          )}
          {ratio === null && (
            <div className="text-xs text-muted mt-1">no activity yet</div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
