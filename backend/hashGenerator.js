// hashGenerator.js
const bcrypt = require('bcryptjs')

const plainPassword = 'jcavalier2025' // aquí va la contraseña original

bcrypt.genSalt(10, (err, salt) => {
  if (err) throw err

  bcrypt.hash(plainPassword, salt, (err, hash) => {
    if (err) throw err

    console.log('🔐 Hash generado:')
    console.log(hash)
  })
})
