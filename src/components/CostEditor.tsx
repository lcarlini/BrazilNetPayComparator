import type { CostFrequency, CostItem } from '../data/costCatalog'
import { costItemMonthlyTotal, costLabel, unitLabel } from '../data/costCatalog'
import { formatBRL } from '../calc'
import { useI18n } from '../i18n'

interface Props {
  title: string
  hint: string
  items: CostItem[]
  onChange: (items: CostItem[]) => void
  onAdd: () => void
  amortizeMonths?: number
  onAmortizeMonthsChange?: (months: number) => void
}

export function CostEditor({
  title,
  hint,
  items,
  onChange,
  onAdd,
  amortizeMonths,
  onAmortizeMonthsChange,
}: Props) {
  const { t, locale } = useI18n()
  const localeTag = locale === 'pt' ? 'pt' : 'en'
  const brl = (n: number) => formatBRL(n, localeTag)

  const update = (id: string, patch: Partial<CostItem>) => {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  const remove = (id: string) => onChange(items.filter((item) => item.id !== id))

  const totalMonthly = items.reduce((s, i) => s + costItemMonthlyTotal(i), 0)

  return (
    <div className="cost-editor">
      <div className="panel-head">
        <div>
          <h3>{title}</h3>
          <p className="field-hint">{hint}</p>
        </div>
        <button type="button" className="linkish" onClick={onAdd}>
          {t.addCostItem}
        </button>
      </div>

      {typeof amortizeMonths === 'number' && onAmortizeMonthsChange && (
        <label className="amortize-row">
          {t.amortize}
          <input
            type="number"
            min={1}
            value={amortizeMonths}
            onChange={(e) => onAmortizeMonthsChange(Number(e.target.value) || 1)}
          />
        </label>
      )}

      <div className="cost-table-wrap">
        <table className="cost-table">
          <thead>
            <tr>
              <th>{t.costName}</th>
              <th>{t.unitAvg}</th>
              <th>{t.quantity}</th>
              <th>{t.frequency}</th>
              <th>{t.monthlyTotal}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <input
                    className="cost-name"
                    value={costLabel(item, locale)}
                    onChange={(e) =>
                      update(item.id, {
                        labelEn: e.target.value,
                        labelPt: e.target.value,
                      })
                    }
                  />
                  <span className="unit-hint">{unitLabel(item, locale)}</span>
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={item.unitValue}
                    onChange={(e) =>
                      update(item.id, { unitValue: Number(e.target.value) || 0 })
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={item.quantity}
                    onChange={(e) =>
                      update(item.id, { quantity: Number(e.target.value) || 0 })
                    }
                  />
                </td>
                <td>
                  <select
                    value={item.frequency}
                    onChange={(e) =>
                      update(item.id, {
                        frequency: e.target.value as CostFrequency,
                        amortizeMonths:
                          e.target.value === 'one_time'
                            ? (item.amortizeMonths ?? amortizeMonths ?? 36)
                            : item.amortizeMonths,
                      })
                    }
                  >
                    <option value="monthly">{t.freqMonthly}</option>
                    <option value="annual">{t.freqAnnual}</option>
                    <option value="one_time">{t.freqOneTime}</option>
                  </select>
                </td>
                <td className="cost-total">
                  <strong>{brl(costItemMonthlyTotal(item))}</strong>
                  <span className="formula">
                    {item.unitValue} × {item.quantity}
                    {item.frequency === 'annual'
                      ? ' ÷ 12'
                      : item.frequency === 'one_time'
                        ? ` ÷ ${item.amortizeMonths ?? 36}`
                        : ''}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => remove(item.id)}
                    aria-label={t.removeCostItem}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4}>{t.costsSubtotal}</td>
              <td colSpan={2}>
                <strong>{brl(totalMonthly)}</strong>
                <span className="formula">{t.perMonth}</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
