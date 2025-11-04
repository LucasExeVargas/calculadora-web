document.addEventListener('DOMContentLoaded', () => {
  const rowsInput = document.getElementById('rows')
  const colsInput = document.getElementById('cols')
  const generateBtn = document.getElementById('generate-btn')
  const matrixContainer = document.getElementById('matrix-inputs')
  const matrixDisplay = document.getElementById('matrix-display')

  generateBtn.addEventListener('click', () => {
    const n = parseInt(rowsInput.value)
    const m = parseInt(colsInput.value)

    if (isNaN(n) || isNaN(m) || n <= 0 || m <= 0) {
      alert('Ingrese dimensiones válidas (n y m mayores que 0).')
      return
    }

    matrixContainer.innerHTML = ''
    matrixDisplay.innerHTML = ''

    // Crear grilla n×m
    matrixContainer.style.gridTemplateColumns = `repeat(${m}, auto)`

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        const input = document.createElement('input')
        input.type = 'number'
        input.placeholder = `a${i + 1}${j + 1}`
        matrixContainer.appendChild(input)
      }
    }

    // Botón para mostrar matriz cargada
    const btnShow = document.createElement('button')
    btnShow.textContent = 'Mostrar matriz'
    btnShow.className = 'btn-generate'
    btnShow.style.marginTop = '20px'
    btnShow.addEventListener('click', () => showMatrix(n, m))
    matrixContainer.appendChild(btnShow)
  })

  function showMatrix(n, m) {
    const inputs = matrixContainer.querySelectorAll('input[type="number"]')
    const matrix = []
    let index = 0

    for (let i = 0; i < n; i++) {
      const row = []
      for (let j = 0; j < m; j++) {
        const val = parseFloat(inputs[index++].value) || 0
        row.push(val)
      }
      matrix.push(row)
    }

    // Mostrar en formato bonito
    let html = '<pre>'
    matrix.forEach(row => {
      html += '[ ' + row.map(v => v.toFixed(2)).join(' , ') + ' ]\n'
    })
    html += '</pre>'
    matrixDisplay.innerHTML = html
  }
})
