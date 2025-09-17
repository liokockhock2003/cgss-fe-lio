import _colors from 'tailwindcss/colors'

export const colors = _colors

const colorsCollection = [
  _colors.red,
  _colors.orange,
  _colors.yellow,
  _colors.green,
  _colors.teal,
  _colors.cyan,
  _colors.blue,
  _colors.violet,
  _colors.fuchsia,
  _colors.pink,
  _colors.rose,
  _colors.amber,
  _colors.lime,
  _colors.sky,
  _colors.indigo,
  _colors.purple,
  _colors.emerald,
]

export const chartJsColors = [400, 500, 600].flatMap((tone) => colorsCollection.map((color) => color[tone]))

export const colorTarget = { borderColor: colors.red[400], backgroundColor: colors.red[500] }
export const colorActual = { borderColor: colors.blue[400], backgroundColor: colors.blue[500] }
