// Módulo para división de polinomios usando Horner Doble
;(() => {
  const math = window.math;

  window.initializeHornerDoble = () => {
    console.log('[v0] Inicializando módulo Horner Doble...');

    const divideBtn = document.getElementById('divide-btn');
    const testBtn = document.getElementById('test-btn-horner-doble');
    const dividendInput = document.getElementById('dividend-input');
    const divisorPInput = document.getElementById('divisor-p');
    const divisorQInput = document.getElementById('divisor-q');
    const resultBox = document.getElementById('result-box');
    const stepsBox = document.getElementById('steps-box');
    const stepsContent = document.getElementById('steps-content');
    const divisorResult = document.getElementById('divisor-result');
    const pValue = document.getElementById('p-value');
    const qValue = document.getElementById('q-value');
    const quotientResult = document.getElementById('quotient-result');
    const remainderResult = document.getElementById('remainder-result');
    const verificationResult = document.getElementById('verification-result');

    if (!divideBtn || !dividendInput || !divisorPInput || !divisorQInput) {
      console.error('[v0] Elementos necesarios no encontrados');
      return;
    }

    dividendInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') divideBtn.click();
    });

    divideBtn.addEventListener('click', () => {
      const dividendExpr = dividendInput.value.trim();
      const p = Number.parseFloat(divisorPInput.value);
      const q = Number.parseFloat(divisorQInput.value);

      if (!dividendExpr) {
        alert('Introduce el polinomio dividendo');
        return;
      }

      if (isNaN(p) || isNaN(q)) {
        alert('Introduce valores numéricos para p y q');
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
        
        // Aplicar el algoritmo de Horner Doble CORREGIDO
        const { quotient, remainder, steps } = hornerDobleDivision(coefficients, n, p, q);
        
        // Mostrar resultados
        pValue.textContent = p;
        qValue.textContent = q;
        quotientResult.textContent = formatPolynomial(quotient);
        remainderResult.textContent = formatPolynomial(remainder);
        
        // Verificación
        const verification = verifyDivision(dividendExpr, quotient, remainder, p, q);
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

    // --- Implementación CORREGIDA del algoritmo de Horner Doble ---
    
    function hornerDobleDivision(P, n, p, q) {
      const steps = [];
      
      steps.push(`Paso 1: Coeficientes del dividendo P = [${P.join(', ')}]`);
      steps.push(`Paso 2: Divisor: x² + (${p})x + (${q})`);
      
      // Inicializar array C para coeficientes del cociente
      // El cociente tendrá grado n-2
      const C = new Array(n + 1).fill(0);
      
      // CORRECCIÓN: Algoritmo de Horner Doble correcto
      // C[n] = P[n]
      C[n] = P[n];
      steps.push(`Paso 3: C[${n}] = P[${n}] = ${P[n]}`);
      
      if (n >= 1) {
        // C[n-1] = P[n-1] - p * C[n]
        C[n-1] = P[n-1] - p * C[n];
        steps.push(`Paso 4: C[${n-1}] = P[${n-1}] - p * C[${n}] = ${P[n-1]} - ${p} * ${C[n]} = ${C[n-1]}`);
      }
      
      // Proceso iterativo para i = n-2 hasta 0
      for (let i = n - 2; i >= 0; i--) {
        // C[i] = P[i] - p * C[i+1] - q * C[i+2]
        C[i] = P[i] - p * C[i+1] - q * C[i+2];
        steps.push(`Paso 5.${n-1-i}: C[${i}] = P[${i}] - p * C[${i+1}] - q * C[${i+2}] = ${P[i]} - ${p} * ${C[i+1]} - ${q} * ${C[i+2]} = ${C[i]}`);
      }
      
      // CORRECCIÓN: El cociente son los coeficientes C[n] hasta C[2] en orden descendente
      const quotientCoefficients = [];
      for (let i = n; i >= 2; i--) {
        quotientCoefficients.push(C[i]);
      }
      
  // CORRECCIÓN: El resto debe estar en orden [constante, coeficiente de x]
  // donde remainderCoefficients[0] es término independiente y [1] el coeficiente de x
  const remainderCoefficients = [C[0], C[1]]; // [término independiente, coeficiente de x]
      
      steps.push(`Paso 6: Coeficientes del cociente Q(x) = [${quotientCoefficients.join(', ')}]`);
      steps.push(`Paso 7: Coeficientes del resto R(x) = [${remainderCoefficients.join(', ')}]`);
      
      return {
        quotient: quotientCoefficients,
        remainder: remainderCoefficients,
        steps: steps
      };
    }

    // --- Funciones auxiliares ---
    
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

    function getPolynomialCoefficients(node) {
      const degree = getPolynomialDegree(node);
      const coefficients = new Array(degree + 1).fill(0);
      
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
              try {
                coefficient *= Number(arg.toString());
              } catch (e) {
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

    function formatPolynomial(coefficients) {
      let polynomial = '';
      let firstTerm = true;
      
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

    function formatNumber(num) {
      if (num % 1 === 0) {
        return num.toString();
      } else {
        return num.toFixed(4).replace(/\.?0+$/, '');
      }
    }

    function verifyDivision(originalPoly, quotient, remainder, p, q) {
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
        
        if (quotientExpr.startsWith(' + ')) {
          quotientExpr = quotientExpr.substring(3);
        }
        
        if (quotientExpr === '') {
          quotientExpr = '0';
        }
        
        // Construir el resto como polinomio
        let remainderExpr = '';
        for (let i = remainder.length - 1; i >= 0; i--) {
          if (remainder[i] !== 0) {
            if (i === 0) {
              remainderExpr += ` + ${formatNumber(remainder[i])}`;
            } else if (i === 1) {
              remainderExpr += ` + ${formatNumber(remainder[i])}*x`;
            } else {
              remainderExpr += ` + ${formatNumber(remainder[i])}*x^${i}`;
            }
          }
        }
        
        if (remainderExpr.startsWith(' + ')) {
          remainderExpr = remainderExpr.substring(3);
        }
        
        if (remainderExpr === '') {
          remainderExpr = '0';
        }
        
        // Construir la expresión de verificación
        const verificationExpr = `(${quotientExpr}) * (x^2 + ${p}*x + ${q}) + (${remainderExpr})`;
        
        // Simplificar y comparar con el polinomio original
        const simplifiedVerification = math.simplify(verificationExpr);
        const simplifiedOriginal = math.simplify(originalPoly);
        
        return `${simplifiedVerification.toString()} = ${simplifiedOriginal.toString()}`;
      } catch (err) {
        return `Error en verificación: ${err.message}`;
      }
    }

    function displaySteps(steps) {
      stepsContent.innerHTML = '';
      steps.forEach((step, index) => {
        const stepElement = document.createElement('div');
        stepElement.className = 'step-item';
        stepElement.textContent = step;
        stepsContent.appendChild(stepElement);
      });
    }

    // Caso de prueba con el ejemplo que mencionaste
    if (testBtn) {
      testBtn.addEventListener('click', () => {
        dividendInput.value = '2*x^4 - 3*x^3 + x - 5';
        divisorPInput.value = '-3';
        divisorQInput.value = '1';
        divideBtn.click();
      });
    }

    console.log('[v0] Módulo Horner Doble inicializado');
  };
})();