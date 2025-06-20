const bcrypt = require('bcryptjs')

const hashedPassword = '$2b$10$CDa0F0dvESKLxzwh4yeq5Olm9mOH.WHAm5a8fJ.2tb57TGxHA.34G'
const inputPassword = 'jcavalier2025'

bcrypt.compare(inputPassword, hashedPassword).then(result => {
  if (result) {
    console.log('✅ Contraseña correcta')
  } else {
    console.log('❌ Contraseña incorrecta')
  }
})
