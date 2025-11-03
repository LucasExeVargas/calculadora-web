// Módulo para división de polinomios usando Horner
;(() => {
  const math = window.math;

  window.initializeDivision = () => {
    console.log('[v0] Inicializando módulo División de Polinomios...');

    const divideBtn = document.getElementById('divide-btn');
    const testBtn = document.getElementById('test-btn-division');
    const dividendInput = document.getElementById('dividend-input');
    const divisorAInput = document.getElementById('divisor-a');
    const divisorBInput = document.getElementById('divisor-b');
    const resultBox = document.getElementById('result-box');
    const stepsBox = document.getElementById('steps-box');
    const stepsContent = document.getElementById('steps-content');
    const divisorResult = document.getElementById('divisor-result');
    const quotientResult = document.getElementById('quotient-result');
    const remainderResult = document.getElementById('remainder-result');
    const verificationResult = document.getElementById('verification-result');

    if (!divideBtn || !dividendInput || !divisorAInput || !divisorBInput) {
      console.error('[v0] Elementos necesarios no encontrados');
      return;
    }

    dividendInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') divideBtn.click();
    });

    divideBtn.addEventListener('click', () => {
      const dividendExpr = dividendInput.value.trim();
      const a = Number.parseFloat(divisorAInput.value);
      const b = Number.parseFloat(divisorBInput.value);

      if (!dividendExpr) {
        alert('Introduce el polinomio dividendo');
        return;
      }

      if (isNaN(a) || isNaN(b)) {
        alert('Introduce valores numéricos para a y b');
        return;
      }

      if (a === 0) {
        alert('El coeficiente a no puede ser cero');
        return;
      }

      try {
        if (typeof math === 'undefined') {
          alert('math.js no está cargado');
          return;
        }

        // Validar que la expresión sea un polinomio en x
        let node;
        try {
          node = math.parse(dividendExpr);
        } catch (parseErr) {
          alert('Error al parsear la expresión: ' + parseErr.message);
          return;
        }

        const isValid = isPolynomialNode(node);
        if (!isValid) {
          alert('La expresión debe ser un polinomio en la variable x (solo sumas, productos, potencias enteras no negativas y constantes).');
          return;
        }

        // Obtener coeficientes del polinomio
        const coefficients = getPolynomialCoefficients(node);
        const n = coefficients.length - 1; // Grado del polinomio
        
        console.log('Coeficientes extraídos:', coefficients);
        
        // Aplicar el algoritmo de Horner según el pseudocódigo
        const { quotient, remainder, steps } = hornerDivision(coefficients, n, a, b);
        
        // Mostrar resultados
        const divisorText = `${a}x ${b}`;
        
        divisorResult.textContent = divisorText;
        quotientResult.textContent = formatPolynomial(quotient);
        remainderResult.textContent = remainder.toString();
        
        // Verificación
        const verification = verifyDivision(dividendExpr, quotient, remainder, a, b);
        verificationResult.textContent = verification;
        
        // Mostrar pasos
        displaySteps(steps);
        
        resultBox.style.display = 'block';
        stepsBox.style.display = 'block';
      } catch (err) {
        alert('Error en la división: ' + err.message);
        console.error(err);
      }
    });

    // --- Implementación del algoritmo de Horner según pseudocódigo ---
    
    // Horner(a[], n, a, b)
    function hornerDivision(coefficients, n, a, b) {
      const steps = [];
      
      // Paso 1: b' = -b/a
      const bPrime = -b / a;
      steps.push(`Paso 1: Calcular b' = -b/a = -(${b})/(${a}) = ${bPrime}`);
      
      // Crear copia de los coeficientes
      const aArray = [...coefficients];
      steps.push(`Paso 2: Coeficientes iniciales: [${aArray.join(', ')}]`);
      
      // Aplicar Horner estándar con b'
      const C = new Array(n + 1).fill(0);
      C[n] = aArray[n];
      
      steps.push(`Paso 3: Inicializar C[${n}] = ${aArray[n]}`);
      
      for (let i = n - 1; i >= 0; i--) {
        C[i] = aArray[i] + bPrime * C[i + 1];
        steps.push(`Paso 4.${n - i}: C[${i}] = a[${i}] + b' * C[${i + 1}] = ${aArray[i]} + ${bPrime} * ${C[i + 1]} = ${C[i]}`);
      }
      
      // El resto es C[0]
      const remainder = C[0];
      steps.push(`Paso 5: Resto R = C[0] = ${remainder}`);
      
      // Ajustar coeficientes del cociente (NO INVERTIRLOS)
      const quotientCoefficients = [];
      for (let i = 1; i <= n; i++) {
        quotientCoefficients.push(C[i] / a);
        steps.push(`Paso 6.${i}: C[${i}]/a = ${C[i]}/${a} = ${C[i] / a}`);
      }
      
      // CORRECCIÓN: Los coeficientes ya están en orden descendente, NO invertirlos
      // quotientCoefficients.reverse(); // ← ESTA LÍNEA ES EL PROBLEMA
      
      steps.push(`Paso 7: Coeficientes del cociente: [${quotientCoefficients.join(', ')}]`);
      
      return {
        quotient: quotientCoefficients,
        remainder: remainder,
        steps: steps
      };
    }

    // --- Funciones auxiliares ---
    
    // Determina si un nodo AST de math.js representa un polinomio en x
    function isPolynomialNode(node) {
      if (!node) return false;

      if (node.type === 'OperatorNode' && (node.op === '+' || node.op === '-')) {
        return isPolynomialNode(node.args[0]) && isPolynomialNode(node.args[1]);
      }

      if (node.type === 'ParenthesisNode') {
        return isPolynomialNode(node.content);
      }

      if (node.type === 'ConstantNode') return true;

      if (node.type === 'SymbolNode') {
        return node.name === 'x';
      }

      if (node.type === 'OperatorNode' && node.fn === 'unaryMinus') {
        return isPolynomialNode(node.args[0]);
      }

      if (node.type === 'OperatorNode' && node.op === '*') {
        return node.args.every((arg) => isMonomialNode(arg));
      }

      if (node.type === 'OperatorNode' && node.op === '^') {
        const base = node.args[0];
        const exp = node.args[1];
        if (base.type === 'SymbolNode' && base.name === 'x') {
          if (exp.type === 'ConstantNode') {
            const val = Number(exp.value);
            return Number.isInteger(val) && val >= 0;
          }
          return false;
        }
        if (isMonomialNode(base) && exp.type === 'ConstantNode') {
          const val = Number(exp.value);
          return Number.isInteger(val) && val >= 0;
        }
        return false;
      }

      if (isMonomialNode(node)) return true;

      return false;
    }

    // Determina si el nodo representa un monomio
    function isMonomialNode(node) {
      if (!node) return false;

      if (node.type === 'ConstantNode') return true;
      if (node.type === 'SymbolNode') return node.name === 'x';
      if (node.type === 'ParenthesisNode') return isMonomialNode(node.content);

      if (node.type === 'OperatorNode' && node.op === '^') {
        const base = node.args[0];
        const exp = node.args[1];
        if (base.type === 'SymbolNode' && base.name === 'x' && exp.type === 'ConstantNode') {
          const val = Number(exp.value);
          return Number.isInteger(val) && val >= 0;
        }
        return false;
      }

      if (node.type === 'OperatorNode' && node.op === '*') {
        return node.args.every((arg) => {
          if (arg.type === 'ConstantNode') return true;
          if (arg.type === 'SymbolNode') return arg.name === 'x';
          if (arg.type === 'ParenthesisNode') return isMonomialNode(arg.content);
          if (arg.type === 'OperatorNode' && arg.op === '^') return isMonomialNode(arg);
          return false;
        });
      }

      if (node.type === 'OperatorNode' && node.fn === 'unaryMinus') {
        return isMonomialNode(node.args[0]);
      }

      return false;
    }

    // Obtiene los coeficientes de un polinomio en orden descendente
    function getPolynomialCoefficients(node) {
      // Primero determinamos el grado máximo del polinomio
      const degree = getPolynomialDegree(node);
      
      // Inicializar coeficientes con ceros
      const coefficients = new Array(degree + 1).fill(0);
      
      // Función mejorada para extraer coeficientes
      function extractCoefficients(expr, sign = 1) {
        if (expr.type === 'ConstantNode') {
          coefficients[0] += sign * Number(expr.value);
          return;
        }
        
        if (expr.type === 'SymbolNode' && expr.name === 'x') {
          coefficients[1] += sign * 1;
          return;
        }
        
        if (expr.type === 'OperatorNode' && expr.op === '^') {
          const base = expr.args[0];
          const exponent = expr.args[1];
          
          if (base.type === 'SymbolNode' && base.name === 'x' && 
              exponent.type === 'ConstantNode') {
            const expValue = Number(exponent.value);
            coefficients[expValue] += sign * 1;
            return;
          }
        }
        
        if (expr.type === 'OperatorNode' && expr.op === '*') {
          let coefficient = sign;
          let exponent = 0;
          let hasX = false;
          
          for (const arg of expr.args) {
            if (arg.type === 'ConstantNode') {
              coefficient *= Number(arg.value);
            } else if (arg.type === 'SymbolNode' && arg.name === 'x') {
              exponent += 1;
              hasX = true;
            } else if (arg.type === 'OperatorNode' && arg.op === '^') {
              const base = arg.args[0];
              const exp = arg.args[1];
              
              if (base.type === 'SymbolNode' && base.name === 'x' && 
                  exp.type === 'ConstantNode') {
                exponent += Number(exp.value);
                hasX = true;
              } else {
                coefficient *= Number(arg.toString());
              }
            } else {
              // Si no es un término simple, evaluamos numéricamente
              try {
                coefficient *= Number(arg.toString());
              } catch (e) {
                // Si no se puede convertir a número, asumimos 1
                coefficient *= 1;
              }
            }
          }
          
          if (hasX) {
            coefficients[exponent] += coefficient;
          } else {
            coefficients[0] += coefficient;
          }
          return;
        }
        
        if (expr.type === 'OperatorNode' && expr.op === '+') {
          extractCoefficients(expr.args[0], sign);
          extractCoefficients(expr.args[1], sign);
          return;
        }
        
        if (expr.type === 'OperatorNode' && expr.op === '-') {
          extractCoefficients(expr.args[0], sign);
          extractCoefficients(expr.args[1], -sign);
          return;
        }
        
        if (expr.type === 'OperatorNode' && expr.fn === 'unaryMinus') {
          extractCoefficients(expr.args[0], -sign);
          return;
        }
        
        if (expr.type === 'ParenthesisNode') {
          extractCoefficients(expr.content, sign);
          return;
        }
      }
      
      extractCoefficients(node);
      return coefficients;
    }

    // Determina el grado de un polinomio
    function getPolynomialDegree(node) {
      if (node.type === 'ConstantNode') return 0;
      if (node.type === 'SymbolNode' && node.name === 'x') return 1;
      
      if (node.type === 'OperatorNode' && node.op === '^') {
        const base = node.args[0];
        const exponent = node.args[1];
        
        if (base.type === 'SymbolNode' && base.name === 'x' && 
            exponent.type === 'ConstantNode') {
          return Number(exponent.value);
        }
      }
      
      if (node.type === 'OperatorNode' && node.op === '*') {
        let degree = 0;
        for (const arg of node.args) {
          if (arg.type === 'SymbolNode' && arg.name === 'x') {
            degree += 1;
          } else if (arg.type === 'OperatorNode' && arg.op === '^') {
            const base = arg.args[0];
            const exp = arg.args[1];
            
            if (base.type === 'SymbolNode' && base.name === 'x' && 
                exp.type === 'ConstantNode') {
              degree += Number(exp.value);
            }
          }
        }
        return degree;
      }
      
      if (node.type === 'OperatorNode' && (node.op === '+' || node.op === '-')) {
        return Math.max(
          getPolynomialDegree(node.args[0]),
          getPolynomialDegree(node.args[1])
        );
      }
      
      if (node.type === 'ParenthesisNode') {
        return getPolynomialDegree(node.content);
      }
      
      if (node.type === 'OperatorNode' && node.fn === 'unaryMinus') {
        return getPolynomialDegree(node.args[0]);
      }
      
      return 0;
    }

    // Formatea un polinomio a partir de sus coeficientes
    function formatPolynomial(coefficients) {
      let polynomial = '';
      let firstTerm = true;
      
      // CORRECCIÓN: Recorrer en orden descendente (de mayor a menor grado)
      for (let i = coefficients.length - 1; i >= 0; i--) {
        const coef = coefficients[i];
        
        if (coef === 0) continue;
        
        let term = '';
        
        if (i === 0) {
          term = formatNumber(coef);
        } else if (i === 1) {
          term = coef === 1 ? 'x' : coef === -1 ? '-x' : `${formatNumber(coef)}x`;
        } else {
          term = coef === 1 ? `x^${i}` : coef === -1 ? `-x^${i}` : `${formatNumber(coef)}x^${i}`;
        }
        
        if (!firstTerm && coef > 0) {
          term = '+' + term;
        }
        
        polynomial += term;
        firstTerm = false;
      }
      
      return polynomial || '0';
    }

    // Formatea números para mostrar correctamente signos
    function formatNumber(num) {
      if (num % 1 === 0) {
        return num.toString();
      } else {
        return num.toFixed(4).replace(/\.?0+$/, '');
      }
    }

    // Verifica la división: P(x) = Q(x) * (ax ± b) + R
    function verifyDivision(originalPoly, quotient, remainder, a, b) {
      try {
        // Construir el cociente como polinomio
        let quotientExpr = '';
        for (let i = quotient.length - 1; i >= 0; i--) {
          if (quotient[i] !== 0) {
            if (i === 0) {
              quotientExpr += ` + ${formatNumber(quotient[i])}`;
            } else if (i === 1) {
              quotientExpr += ` + ${formatNumber(quotient[i])}*x`;
            } else {
              quotientExpr += ` + ${formatNumber(quotient[i])}*x^${i}`;
            }
          }
        }
        
        // Eliminar el primer "+" si existe
        if (quotientExpr.startsWith(' + ')) {
          quotientExpr = quotientExpr.substring(3);
        }
        
        if (quotientExpr === '') {
          quotientExpr = '0';
        }
        
        // Construir la expresión de verificación
        const verificationExpr = `(${quotientExpr}) * (${a}*x + ${b}) + ${remainder}`;
        
        // Simplificar y comparar con el polinomio original
        const simplifiedVerification = math.simplify(verificationExpr);
        const simplifiedOriginal = math.simplify(originalPoly);
        
        return `${simplifiedVerification.toString()} = ${simplifiedOriginal.toString()}`;
      } catch (err) {
        return `Error en verificación: ${err.message}`;
      }
    }

    // Muestra los pasos del algoritmo
    function displaySteps(steps) {
      stepsContent.innerHTML = '';
      steps.forEach((step, index) => {
        const stepElement = document.createElement('div');
        stepElement.className = 'step-item';
        stepElement.textContent = step;
        stepsContent.appendChild(stepElement);
      });
    }

    // Caso de prueba
    if (testBtn) {
      testBtn.addEventListener('click', () => {
        dividendInput.value = '6*x^4 - 19*x^3 + 7*x^2 + 23*x - 3';
        divisorAInput.value = '2';
        divisorBInput.value = '1';
        divideBtn.click();
      });
    }

    console.log('[v0] Módulo División de Polinomios inicializado');
  };
})();