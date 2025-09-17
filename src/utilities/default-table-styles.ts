export const defaultTableStyle = (cols) =>
  cols.map((col) => ({
    ...col,
    _style: { backgroundColor: '#044A89', color: 'white', ...col?._style },
    _props: { color: 'primary', className: 'fw-semibold' },
  }))
