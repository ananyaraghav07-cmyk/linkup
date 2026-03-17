import DashboardCard from './DashboardCard';
import { SCENARIO_MODES } from '../modules/scenarioModes';

function SimulationModeSelectorCard({ mode, onChangeMode }) {
    return (
        <DashboardCard icon="🎛️" title="Simulation Mode">
            <select
                className="form-select ll-control"
                value={mode || SCENARIO_MODES.normal}
                onChange={(e) => onChangeMode?.(e.target.value)}
            >
                <option value={SCENARIO_MODES.normal}>Normal</option>
                <option value={SCENARIO_MODES.heart_rate_spike}>Heart Rate Spike</option>
                <option value={SCENARIO_MODES.oxygen_drop}>Oxygen Drop</option>
                <option value={SCENARIO_MODES.fever_spike}>Fever Spike</option>
            </select>
            <div className="small mt-2" style={{ color: 'var(--text-muted)' }}>
                Wrapper-only: does not modify existing simulator unless wired.
            </div>
        </DashboardCard>
    );
}

export default SimulationModeSelectorCard;
