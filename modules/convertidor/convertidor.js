// Módulo de Convertidor de Bases Numéricas con Punto Flotante (versión fiel a Python)

window.initializeConversor = () => {
  console.log("[Python-fiel] Inicializando módulo de convertidor...")

  const convertBtn = document.getElementById("convert-btn")
  const inputNumber = document.getElementById("input-number")
  const inputBase = document.getElementById("input-base")
  const outputBase = document.getElementById("output-base")
  const precision = document.getElementById("precision")

  if (!convertBtn || !inputNumber || !inputBase || !outputBase || !precision) {
    console.error("[Python-fiel] Error: No se encontraron todos los elementos necesarios")
    return
  }

  // Reemplazar botón para limpiar listeners anteriores
  const newConvertBtn = convertBtn.cloneNode(true)
  convertBtn.replaceWith(newConvertBtn)

  // Permitir Enter en el campo de número
  inputNumber.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      newConvertBtn.click()
    }
  })

  // Botón Convertir
  newConvertBtn.addEventListener("click", () => {
    const number = inputNumber.value.trim()
    const inBase = Number.parseInt(inputBase.value)
    const outBase = Number.parseInt(outputBase.value)
    const prec = Number.parseInt(precision.value)

    // Validaciones
    const validation = validateInput(number, inBase, prec)
    if (!validation.valid) {
      showError(validation.error)
      return
    }

    try {
      // Convertir usando el algoritmo fiel a Python
      const result = convertirYRedondear(number, inBase, outBase, prec)

      // Mostrar resultados
      displayResultsPythonStyle(number, inBase, outBase, prec, result)
      hideError()
    } catch (error) {
      showError("Error en la conversión: " + error.message)
    }
  })

  console.log("[Python-fiel] Módulo de convertidor inicializado correctamente")
}

// ========== FUNCIONES FIELES AL CÓDIGO PYTHON ==========

const DIGITS = "0123456789ABCDEF"

function charToVal(c) {
  c = c.toUpperCase()
  const index = DIGITS.indexOf(c)
  if (index === -1) {
    throw new Error(`Dígito inválido: ${c}`)
  }
  return index
}

function valToChar(v) {
  if (v < 0 || v >= DIGITS.length) {
    throw new Error(`Valor inválido: ${v}`)
  }
  return DIGITS[v]
}

function baseToDecimal(numStr, base) {
  if (numStr.includes('.')) {
    const [ent, frac] = numStr.split('.')
    return baseToDecimalWithFraction(ent, frac || '', base)
  } else {
    return baseToDecimalWithFraction(numStr, '', base)
  }
}

function baseToDecimalWithFraction(ent, frac, base) {
  let entVal = 0
  for (const ch of ent) {
    entVal = entVal * base + charToVal(ch)
  }

  let fracVal = 0.0
  let powb = base
  for (const ch of frac) {
    fracVal += charToVal(ch) / powb
    powb *= base
  }

  return entVal + fracVal
}

function decimalToBaseFractionBetween0and1(x, base, digits) {
  if (x < 0 || x >= 1) {
    throw new Error("x debe estar entre 0 y 1")
  }

  const s = []
  let frac = x
  
  for (let i = 0; i < digits; i++) {
    frac *= base
    const d = Math.floor(frac + 1e-15) // Tolerancia como en Python
    s.push(valToChar(d))
    frac -= d
    if (Math.abs(frac) < 1e-15) break // Salir si es cero
  }

  return s.join('')
}

function normalizePFN(x, base, fracDigits = 60) {
  if (x === 0) {
    return { mantissa: "0.0", exponent: 0 }
  }

  // e = floor(log_base(x)) + 1 ensures 1/b <= m < 1
  const exponent = Math.floor(Math.log(x) / Math.log(base)) + 1
  const m = x / Math.pow(base, exponent)
  
  // Convertir m (0<=m<1) a dígitos fraccionarios
  const frac = decimalToBaseFractionBetween0and1(m, base, fracDigits)
  const mantissa = "0." + frac
  
  return { mantissa, exponent }
}

function truncationFromMantissa(mantissaStr, t) {
  if (!mantissaStr.startsWith("0.")) {
    throw new Error("Formato de mantisa inválido")
  }

  let digits = mantissaStr.substring(2)
  
  // digits may be shorter than t; pad with '0'
  if (digits.length < t) {
    digits = digits + "0".repeat(t - digits.length)
  }
  
  const kept = digits.substring(0, t)
  return kept
}

function digitsStrToInt(digitsStr, base) {
  let v = 0
  for (const ch of digitsStr) {
    v = v * base + charToVal(ch)
  }
  return v
}

function digitsStrToFraction(digitsStr, base) {
  let val = 0.0
  let powb = base
  
  for (const ch of digitsStr) {
    val += charToVal(ch) / powb
    powb *= base
  }
  
  return val
}

function roundSymmetricPFN(mantissaStr, base, t, tol = 1e-12) {
  if (!mantissaStr.startsWith("0.")) {
    throw new Error("Formato de mantisa inválido")
  }

  let digits = mantissaStr.substring(2)
  
  // suficiente cantidad de dígitos
  if (digits.length < t + 10) {
    digits = digits + "0".repeat(t + 10 - digits.length)
  }
  
  const A_digits = digits.substring(0, t)               // primeros t dígitos
  const tail_digits = digits.substring(t)              // dígitos restantes

  // valores
  const A_int = digitsStrToInt(A_digits, base)
  const tail_unscaled = digitsStrToFraction(tail_digits, base)  // entre 0 y 1 (approx)

  // comparar tail_unscaled con 1/2
  const half = 0.5
  let new_A_int = A_int
  
  if (tail_unscaled > half + tol || Math.abs(tail_unscaled - half) <= tol) {
    new_A_int += 1
  }

  // ahora construir mant_new = A_int / b^t -> representarla en t dígitos
  // si A_int == b^t entonces mant_new == 1 -> habrá que renormalizar
  if (new_A_int >= Math.pow(base, t)) {
    // mantissa efectivamente 1 -> renormalizamos: m_new = 1/base y exponent_inc = 1
    const mant_new_digits = "1" + "0".repeat(t - 1)
    return { mantissa: "0." + mant_new_digits, exponentIncrement: 1 }
  } else {
    // convertir A_int a string de t dígitos base `base`
    const s = []
    let tmp = new_A_int
    
    for (let i = 0; i < t; i++) {
      s.push(valToChar(tmp % base))
      tmp = Math.floor(tmp / base)
    }
    
    const mant_new_digits = s.reverse().join('')
    return { mantissa: "0." + mant_new_digits, exponentIncrement: 0 }
  }
}

function mantissaStrToDecimal(mantStr, base) {
  return digitsStrToFraction(mantStr.substring(2), base)
}

function decimalToBaseFull(x, base, fracDigits = 60) {
  const fullEnt = Math.floor(x)
  const fullFrac = x - fullEnt

  // convertir la parte entera
  let ent_s = "0"
  if (fullEnt > 0) {
    const s = []
    let tmp = fullEnt
    while (tmp > 0) {
      s.push(valToChar(tmp % base))
      tmp = Math.floor(tmp / base)
    }
    ent_s = s.reverse().join('')
  }

  const frac_s = decimalToBaseFractionBetween0and1(fullFrac, base, fracDigits)
  return ent_s + "." + frac_s
}

// --- función principal que integra todo ---
function convertirYRedondear(inputStr, b_from, b_to, t) {
  const x = baseToDecimal(inputStr, b_from)
  
  // representación sin normalizar en base destino
  const representation = decimalToBaseFull(x, b_to, 60)
  
  // normalizar en PFN
  const { mantissa, exponent } = normalizePFN(x, b_to, 80)
  
  // truncamiento por corte
  const mant_cut = truncationFromMantissa(mantissa, t)
  const mant_cut_str = "0." + mant_cut
  
  // redondeo simétrico
  const { mantissa: mant_round_str, exponentIncrement } = roundSymmetricPFN(mantissa, b_to, t)
  const e_round = exponent + exponentIncrement

  // calcular valores decimales para verificación
  const val_cut = mantissaStrToDecimal(mant_cut_str, b_to) * Math.pow(b_to, exponent)
  const val_round = mantissaStrToDecimal(mant_round_str, b_to) * Math.pow(b_to, e_round)

  return {
    orig: x,
    representation,
    pfn: { mantissa, exponent },
    cut: { mantissa: mant_cut_str, exponent, decimal: val_cut },
    round: { mantissa: mant_round_str, exponent: e_round, decimal: val_round }
  }
}

// ========== FUNCIONES AUXILIARES ==========

function validateInput(number, base, precision) {
  if (!number || number.length === 0) {
    return { valid: false, error: "Por favor, ingrese un número" }
  }

  if (isNaN(precision) || precision < 1 || precision > 100) {
    return { valid: false, error: "La precisión debe estar entre 1 y 100" }
  }

  const parts = number.split(".")
  if (parts.length > 2) {
    return { valid: false, error: "El número no puede tener más de un punto decimal" }
  }

  const validChars = getValidCharsForBase(base)
  for (const char of number.toLowerCase()) {
    if (char !== "." && !validChars.includes(char)) {
      return {
        valid: false,
        error: `El carácter '${char}' no es válido para base ${base}. Caracteres válidos: ${validChars.join(", ")}`,
      }
    }
  }

  return { valid: true }
}

function getValidCharsForBase(base) {
  const chars = {
    2: ["0", "1"],
    3: ["0", "1", "2"],
    4: ["0", "1", "2", "3"],
    5: ["0", "1", "2", "3", "4"],
    6: ["0", "1", "2", "3", "4", "5"],
    7: ["0", "1", "2", "3", "4", "5", "6"],
    8: ["0", "1", "2", "3", "4", "5", "6", "7"],
    9: ["0", "1", "2", "3", "4", "5", "6", "7", "8"],
    10: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    11: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a"],
    12: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b"],
    13: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c"],
    14: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d"],
    15: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e"],
    16: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"],
  }
  return chars[base] || []
}

function formatPFN(mantissa, exponent, base) {
  return `${mantissa} × ${base}^${exponent}`
}

// ========== MOSTRAR RESULTADOS ESTILO PYTHON ==========

function displayResultsPythonStyle(inputNumber, inputBase, outputBase, precision, result) {
  // Mostrar información de entrada
  document.getElementById("info-input-number").textContent = inputNumber
  document.getElementById("info-input-base").textContent = `Base ${inputBase}`
  document.getElementById("info-output-base").textContent = `Base ${outputBase}`
  document.getElementById("info-precision").textContent = precision

  // Resultados con todos los dígitos
  const allUnnormalized = `${result.representation} × ${outputBase}^0`
  const allNormalized = formatPFN(result.pfn.mantissa, result.pfn.exponent, outputBase)

  document.getElementById("result-all-unnormalized").textContent = allUnnormalized
  document.getElementById("result-all-normalized").textContent = allNormalized

  // Resultados con precisión - Por corte
  const cutUnnormalized = `${result.representation} × ${outputBase}^0`
  const cutNormalized = formatPFN(result.cut.mantissa, result.cut.exponent, outputBase)

  document.getElementById("result-cut-unnormalized").textContent = cutUnnormalized
  document.getElementById("result-cut-normalized").textContent = cutNormalized

  // Resultados con precisión - Por redondeo simétrico
  const roundUnnormalized = `${result.representation} × ${outputBase}^0`
  const roundNormalized = formatPFN(result.round.mantissa, result.round.exponent, outputBase)

  document.getElementById("result-round-unnormalized").textContent = roundUnnormalized
  document.getElementById("result-round-normalized").textContent = roundNormalized

  // Mostrar sección de resultados
  document.getElementById("results-section").style.display = "block"
}

function showError(message) {
  document.getElementById("error-message").textContent = message
  document.getElementById("error-section").style.display = "block"
  document.getElementById("results-section").style.display = "none"
}

function hideError() {
  document.getElementById("error-section").style.display = "none"
}