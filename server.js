require("dotenv-safe").config();
const jwt = require('jsonwebtoken');
const http = require('http');
const express = require('express');
const { body } = require("express-validator")
const app = express();
const expressValidator = require('express-validator')
const bodyParser = require('body-parser');


app.use(express.json())

app.get('/', (req, res, next) => {
    res.json({message: "Sucesso na conexão"});
})

app.get('/clientes', verifyJWT, (req, res, next) => {
    console.log("Retornou todos clientes!");
    res.json([{
        id: 1,
        name: 'Pedro',
        email: 'pedroruffo@mobi.com',
        password: "Senha123",
        telephones: 11994907467
    }]);
})

//Autorização
function verifyJWT(req, res, next){
    const token = req.headers['x-access-token'];
    if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });

    jwt.verify(token, process.env.SECRET, function(err, decoded) {
      if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });

      // se tudo estiver ok, salva no request para uso posterior
      req.userId = decoded.id;
      next();
    })};


//Autenticação de login
app.post('/login', (req, res, next) => {
    //esse teste abaixo deve ser feito no seu banco de dados
    if(req.body.user === 'Pedro' && req.body.password === 'Senha123'){
      //auth ok
      const id = 1; //esse id viria do banco de dados
      const token = jwt.sign({ id }, process.env.SECRET, {
        expiresIn: 300 // expires in 5min
      });
      return res.json({ auth: true, token: token });
      console.log(print(token));
    }

    res.status(500).json({message: 'Login inválido!'});
})

//Validação de API de registro de usuário
app.post("/register-user", [
    body("name").isLength({min: 3, max: 30}).withMessage("Nome precisa ter no mínimo 3 caracteres!"),
    body("email").isEmail().withMessage("Preencha um e-mail válido!"),
    body("email").custom(value => {
        if(!value) {
            return Promise.reject("E-mail é obrigatório!")
        }
        if(value == "pedroruffo@gmail.com") {
            return Promise.reject("E-mail já cadastrado!")
        }
    }),
    body("password").isLength({min: 8, max: 20}).withMessage("Senha precisa ter no mínimo 8 caracteres!"),
    body("telephones").isNumeric().withMessage("Telefone precisa ser número!"),

], (req, res) => {
    //
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).json( {errors: errors.array()} );
    }

    // se sim
    res.json({msg: "Register user sucess!"});
} );


//validação dos dados //Msg em ingles
app.post("/user", [
    body("name").isString(),
    body("email").isEmail(),
    body("password").isLength({min: 5}),
    body("telephones").isNumeric(),
], (req, res) => {
    //
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).json( {errors: errors.array()} );
    }
    res.json({msg: "sucess!"});
} );


//validação de dados //Msg em portguês
app.post("/validator-withmessage", [
    body("name").isString().withMessage("Preencha um nome válido!"),
    body("email").isEmail().withMessage("Preencha um e-mail válido!"),
    body("password").isLength({min: 5}).withMessage("Preencha no mínimo 6 caracteres para a senha!"),
    body("telephones").isNumeric(),
], (req, res) => {
    //
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).json( {errors: errors.array()} );
    }

    res.json({msg: "sucess!"});
} );

//Saída do app (Logout)
app.post('/logout', function(req, res) {
    res.json({ auth: false, token: null });
})


const server = http.createServer(app);
server.listen(3000);
console.log("Servidor escutando na porta 3000...")
