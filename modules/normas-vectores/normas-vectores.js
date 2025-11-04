// modules/normas-vectores/normas-vectores.js
;(() => {
    const math = window.math

    window.initializeNormasVectores = () => {
        console.log('[v0] Inicializando módulo Normas de Vectores...')

        const dimensionInput = document.getElementById('vector-dimension')
        const generateBtn = document.getElementById('generate-vector-btn')
        const calculateBtn = document.getElementById('calculate-norms-btn')
        const testBtn = document.getElementById('test-btn-vector')
        const vectorContainer = document.getElementById('vector-container')
        const resultsSection = document.getElementById('results-section-vector')

        let currentVector = null
        let currentChart = null

        if (!generateBtn || !calculateBtn) {
            console.error('[v0] Elementos necesarios no encontrados')
            return
        }

        // Generar inputs para componentes del vector
        generateBtn.addEventListener('click', () => {
            const dimension = parseInt(dimensionInput.value)
            if (dimension < 1 || dimension > 10) {
                alert('La dimensión debe estar entre 1 y 10')
                return
            }

            generateVectorInputs(dimension)
            vectorContainer.style.display = 'block'
            resultsSection.style.display = 'none'
            updateVectorPreview()
        })

        // Calcular normas
        calculateBtn.addEventListener('click', () => {
            const vector = collectVectorComponents()
            if (!vector) {
                alert('Por favor, completa todos los componentes del vector')
                return
            }

            try {
                currentVector = vector
                const norms = calculateVectorNorms(vector)
                displayNormsResults(norms, vector)
                plotVector(vector)
                resultsSection.style.display = 'block'
            } catch (err) {
                alert('Error calculando las normas: ' + err.message)
            }
        })

        // Caso de prueba: Vector [3, 4, 5]
        if (testBtn) {
            testBtn.addEventListener('click', () => {
                // Poner dimensión y generar inputs
                dimensionInput.value = '3'
                // Reutilizar el botón generar para crear los inputs
                generateBtn.click()

                // Rellenar componentes y calcular tras un pequeño retardo
                setTimeout(() => {
                    const inputs = document.querySelectorAll('#vector-inputs input')
                    if (inputs && inputs.length >= 3) {
                        inputs[0].value = '3'   // v₁
                        inputs[1].value = '4'   // v₂
                        inputs[2].value = '5'   // v₃
                        vectorContainer.style.display = 'block'
                        updateVectorPreview()
                        // Ejecutar cálculo y graficado
                        calculateBtn.click()
                    }
                }, 150)
            })
        }

        function generateVectorInputs(dimension) {
            const container = document.getElementById('vector-inputs')
            container.innerHTML = ''

            for (let i = 0; i < dimension; i++) {
                const div = document.createElement('div')
                div.className = 'vector-input'
                
                div.innerHTML = `
                    <input type="number" id="vector-component-${i}" step="0.1" placeholder="0" value="${i === 0 ? '1' : '0'}">
                    <label for="vector-component-${i}">v<sub>${i + 1}</sub></label>
                `
                
                const input = div.querySelector('input')
                input.addEventListener('input', updateVectorPreview)
                
                container.appendChild(div)
            }
        }

        function updateVectorPreview() {
            const vector = collectVectorComponents()
            if (!vector) return

            const vectorStr = vector.map(v => Number.isInteger(v) ? v : v.toFixed(2)).join(', ')
            document.getElementById('vector-preview').innerHTML = `Vector: [ ${vectorStr} ]`
        }

        function collectVectorComponents() {
            const dimension = parseInt(dimensionInput.value)
            const vector = []

            for (let i = 0; i < dimension; i++) {
                const input = document.getElementById(`vector-component-${i}`)
                if (!input || input.value === '') {
                    return null
                }
                vector.push(parseFloat(input.value))
            }

            return vector
        }

        function calculateVectorNorms(vector) {
            // Norma 1: Suma de valores absolutos
            const norm1 = vector.reduce((sum, value) => sum + Math.abs(value), 0)
            
            // Norma 2: Euclidiana
            const norm2 = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0))
            
            // Norma Infinito: Máximo valor absoluto
            const normInf = Math.max(...vector.map(value => Math.abs(value)))
            
            return {
                norm1: norm1,
                norm2: norm2,
                normInf: normInf
            }
        }

        function displayNormsResults(norms, vector) {
            const { norm1, norm2, normInf } = norms

            function formatValue(value) {
                if (value === null || value === undefined) return 'No calculable'
                return value.toFixed(6)
            }

            document.getElementById('norm1-result').textContent = formatValue(norm1)
            document.getElementById('norm2-result').textContent = formatValue(norm2)
            document.getElementById('norm-inf-result').textContent = formatValue(normInf)

            // Calcular información adicional
            const unitVector = calculateUnitVector(vector, norm2)
            const angles = calculateAngles(vector, norm2)
            const dotProduct = calculateDotProduct(vector, vector)

            // Mostrar información adicional
            document.getElementById('unit-vector-result').textContent = 
                unitVector ? `[ ${unitVector.map(v => v.toFixed(4)).join(', ')} ]` : 'No aplicable'
            
            document.getElementById('angles-result').textContent = 
                angles ? angles.map(angle => `${angle.toFixed(1)}°`).join(', ') : 'No aplicable'
            
            document.getElementById('dot-product-result').textContent = formatValue(dotProduct)
        }

        function calculateUnitVector(vector, norm2) {
            if (norm2 === 0) return null
            return vector.map(component => component / norm2)
        }

        function calculateAngles(vector, norm2) {
            if (norm2 === 0) return null
            const angles = []
            for (let i = 0; i < vector.length; i++) {
                const angle = Math.acos(vector[i] / norm2) * (180 / Math.PI)
                angles.push(angle)
            }
            return angles
        }

        function calculateDotProduct(v1, v2) {
            if (v1.length !== v2.length) return null
            return v1.reduce((sum, val, i) => sum + val * v2[i], 0)
        }

        function plotVector(vector) {
            const canvas = document.getElementById('vector-chart')
            const ctx = canvas.getContext('2d')

            if (currentChart) {
                currentChart.destroy()
            }

            const dimension = vector.length

            if (dimension === 2) {
                plot2DVector(vector, ctx)
            } else if (dimension === 3) {
                plot3DVector(vector, ctx)
            } else {
                // Para dimensiones mayores a 3, mostrar mensaje
                ctx.clearRect(0, 0, canvas.width, canvas.height)
                ctx.fillStyle = '#e0e0e0'
                ctx.font = '16px Arial'
                ctx.textAlign = 'center'
                ctx.fillText('Representación gráfica disponible solo para 2D y 3D', 
                           canvas.width / 2, canvas.height / 2)
            }
        }

        function plot2DVector(vector, ctx) {
            const [x, y] = vector
            const canvas = ctx.canvas
            
            // Configurar canvas
            canvas.width = 400
            canvas.height = 400
            
            // Limpiar canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            
            // Configurar sistema de coordenadas
            const centerX = canvas.width / 2
            const centerY = canvas.height / 2
            const scale = 20 // Escala para visualización
            
            // Dibujar ejes
            ctx.strokeStyle = '#3a3a3a'
            ctx.lineWidth = 1
            
            // Eje X
            ctx.beginPath()
            ctx.moveTo(0, centerY)
            ctx.lineTo(canvas.width, centerY)
            ctx.stroke()
            
            // Eje Y
            ctx.beginPath()
            ctx.moveTo(centerX, 0)
            ctx.lineTo(centerX, canvas.height)
            ctx.stroke()
            
            // Dibujar vector
            const endX = centerX + x * scale
            const endY = centerY - y * scale // Invertir Y para coordenadas cartesianas
            
            ctx.strokeStyle = '#ff6b9d'
            ctx.lineWidth = 3
            ctx.beginPath()
            ctx.moveTo(centerX, centerY)
            ctx.lineTo(endX, endY)
            ctx.stroke()
            
            // Dibujar punta de flecha
            drawArrowHead(ctx, centerX, centerY, endX, endY)
            
            // Dibujar punto en el origen
            ctx.fillStyle = '#6bcf7f'
            ctx.beginPath()
            ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI)
            ctx.fill()
            
            // Etiquetas
            ctx.fillStyle = '#b0b0b0'
            ctx.font = '12px Arial'
            ctx.textAlign = 'center'
            
            // Etiqueta del vector
            ctx.fillText(`v = (${x}, ${y})`, endX + 20, endY - 10)
            
            // Etiquetas de ejes
            ctx.fillText('X', canvas.width - 10, centerY - 10)
            ctx.fillText('Y', centerX + 10, 10)
        }

        function plot3DVector(vector, ctx) {
            const [x, y, z] = vector
            const canvas = ctx.canvas
            
            // Configurar canvas
            canvas.width = 400
            canvas.height = 400
            
            // Limpiar canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            
            // Proyección isométrica simple
            const centerX = canvas.width / 2
            const centerY = canvas.height / 2
            const scale = 15
            
            // Calcular coordenadas proyectadas
            const projX = centerX + (x - z) * 0.7 * scale
            const projY = centerY + (y - z) * 0.7 * scale
            
            // Dibujar ejes
            ctx.strokeStyle = '#3a3a3a'
            ctx.lineWidth = 1
            
            // Eje X (rojo)
            ctx.beginPath()
            ctx.moveTo(centerX, centerY)
            ctx.lineTo(centerX + 100, centerY)
            ctx.strokeStyle = '#ff6b6b'
            ctx.stroke()
            
            // Eje Y (verde)
            ctx.beginPath()
            ctx.moveTo(centerX, centerY)
            ctx.lineTo(centerX, centerY - 100)
            ctx.strokeStyle = '#6bcf7f'
            ctx.stroke()
            
            // Eje Z (azul)
            ctx.beginPath()
            ctx.moveTo(centerX, centerY)
            ctx.lineTo(centerX - 70, centerY + 70)
            ctx.strokeStyle = '#5b7cfa'
            ctx.stroke()
            
            // Dibujar vector
            ctx.strokeStyle = '#ff6b9d'
            ctx.lineWidth = 3
            ctx.beginPath()
            ctx.moveTo(centerX, centerY)
            ctx.lineTo(projX, projY)
            ctx.stroke()
            
            // Dibujar punta de flecha
            drawArrowHead(ctx, centerX, centerY, projX, projY)
            
            // Dibujar punto en el origen
            ctx.fillStyle = '#6bcf7f'
            ctx.beginPath()
            ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI)
            ctx.fill()
            
            // Etiquetas
            ctx.fillStyle = '#b0b0b0'
            ctx.font = '12px Arial'
            ctx.textAlign = 'center'
            
            // Etiqueta del vector
            ctx.fillText(`v = (${x}, ${y}, ${z})`, projX + 30, projY - 10)
            
            // Etiquetas de ejes
            ctx.fillText('X', centerX + 110, centerY + 15)
            ctx.fillText('Y', centerX - 10, centerY - 110)
            ctx.fillText('Z', centerX - 80, centerY + 85)
        }

        function drawArrowHead(ctx, fromX, fromY, toX, toY) {
            const headLength = 15
            const angle = Math.atan2(toY - fromY, toX - fromX)
            
            ctx.strokeStyle = '#ff6b9d'
            ctx.lineWidth = 3
            
            // Dibujar punta de flecha
            ctx.beginPath()
            ctx.moveTo(toX, toY)
            ctx.lineTo(
                toX - headLength * Math.cos(angle - Math.PI / 6),
                toY - headLength * Math.sin(angle - Math.PI / 6)
            )
            ctx.moveTo(toX, toY)
            ctx.lineTo(
                toX - headLength * Math.cos(angle + Math.PI / 6),
                toY - headLength * Math.sin(angle + Math.PI / 6)
            )
            ctx.stroke()
            
            // Rellenar punta de flecha
            ctx.fillStyle = '#ff6b9d'
            ctx.beginPath()
            ctx.moveTo(toX, toY)
            ctx.lineTo(
                toX - headLength * Math.cos(angle - Math.PI / 6),
                toY - headLength * Math.sin(angle - Math.PI / 6)
            )
            ctx.lineTo(
                toX - headLength * Math.cos(angle + Math.PI / 6),
                toY - headLength * Math.sin(angle + Math.PI / 6)
            )
            ctx.closePath()
            ctx.fill()
        }

        console.log('[v0] Módulo Normas de Vectores inicializado')
    }
})()