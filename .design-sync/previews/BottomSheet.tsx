import BottomSheet from 'pokeweather/src/components/BottomSheet/BottomSheet'

const CityList = () => (
  <div style={{ padding: '0 16px' }}>
    {['Tokyo', 'Paris', 'New York', 'Sydney', 'Cairo'].map((city) => (
      <div
        key={city}
        style={{
          padding: '12px 0',
          borderBottom: '1px solid var(--border-default)',
          color: 'var(--text-primary)',
          fontSize: 14,
        }}
      >
        {city}
      </div>
    ))}
  </div>
)

// BottomSheet arranca en snap middle (40vh) por defecto.
// Para simular collapsed/expanded en preview estatico, se envuelve
// en un contenedor con altura fija que imita el viewport.

export function BottomSheetCollapsed() {
  return (
    <div style={{ position: 'relative', height: 200, overflow: 'hidden', background: 'var(--bg-secondary)' }}>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '5vh',
          background: 'var(--bg-primary)',
          borderTop: '1px solid var(--border-default)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 8,
        }}
      >
        <div style={{ width: 40, height: 4, background: 'var(--border-default)', borderRadius: 2 }} />
      </div>
    </div>
  )
}

export function BottomSheetMiddle() {
  return (
    <div style={{ position: 'relative', height: 400, overflow: 'hidden', background: 'var(--bg-secondary)' }}>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40%',
          background: 'var(--bg-primary)',
          borderTop: '1px solid var(--border-default)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 40, height: 4, background: 'var(--border-default)', borderRadius: 2 }} />
        </div>
        <CityList />
      </div>
    </div>
  )
}

export function BottomSheetExpanded() {
  return (
    <div style={{ position: 'relative', height: 500, overflow: 'hidden', background: 'var(--bg-secondary)' }}>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '80%',
          background: 'var(--bg-primary)',
          borderTop: '1px solid var(--border-default)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 40, height: 4, background: 'var(--border-default)', borderRadius: 2 }} />
        </div>
        <CityList />
      </div>
    </div>
  )
}

export function BottomSheetLive() {
  return (
    <div style={{ position: 'relative', height: 500, overflow: 'hidden', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
      <BottomSheet>
        <CityList />
      </BottomSheet>
    </div>
  )
}
