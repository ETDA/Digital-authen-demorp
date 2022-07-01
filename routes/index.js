const express = require('express');
const router = express.Router();
const jwtDecode = require('jwt-decode');
const crypto = require("crypto");
const idpService = require("../services/idp_sevice")
const help = require("../services/bkfHelp");
const { async } = require('crypto-random-string');

router.get('/', function (req, res, next) {
  res.render('index', {baseurl: process.env.BASEURL});
});

router.get('/login', function (req, res, next) {
  console.log("===login===")
  req.session.idp = req.query.idp;
  req.session.state = crypto.randomBytes(10).toString('hex');
  const client = req.clients.getClient(req.session.idp);
  const redirect_uri = client.getAuthorizationUrl(req.session.state);
  // console.log(redirect_uri);
  res.redirect(redirect_uri);

});

router.get('/callback', async function (req, res, next) {
  console.log("===callback===")
  console.log(req.query)
  try {
    console.log(req.session.idp);
    const client = req.clients.getClient(req.session.idp);
     console.log(client);
    const query = {
      code: req.query.code,
      state: req.session.state,
    }
    let assertion = await client.getToken(req.query, req.session.state);
    req.session.assertion = assertion
    // console.log('expires', new Date(assertion.expires_at * 1000));
    // console.log('raw assertion', assertion);
    // res.redirect('/assertion_decode?assertion=' + JSON.stringify(assertion));
    res.redirect('/home');
  } catch (err) {
    console.log(err);
    res.send(err.toString());
  }
});

// router.get('/assertion_decode', async (req, res, next) => {
  router.get('/home', help.isAuthenticated,async (req, res, next) => {
  console.log("===user===")
  const id_token_decode = jwtDecode(req.session.assertion.id_token);
  console.log("decode token: ",id_token_decode)
  // req.session.emaillogin = id_token_decode.sub;
  // const alluser = await idpService.callGetUser('Bearer ' + req.session.assertion.id_token)
  // let customData = []
  // if (alluser.result !== undefined) {
  //   console.log("ERROR CALL API")
  //   // res.send(alluser)
  // } else {
  //   console.log("PASS CALL API")
  //   customData = await help.customDataHaveEmail(alluser)
  //   // res.send(customData)
  // }
  // res.render('home', { baseurl: process.env.BASEURL ,user:req.session.emaillogin,userData: customData });
  res.render('home', { baseurl: process.env.BASEURL ,user:req.session.emaillogin });
});

// router.post('/activecode',help.isAuthenticated, async (req, res, next) => {
//   console.log("===activecode===")
//   // console.log(req.body)
//   // console.log(req.session.idToken)
//   let fromMail = "napon@etda.or.th"
//   // let toMail = "napon@etda.or.th"
//   let toMail = req.body.email
//   let subject = "Your Activation code"
//   let code = await help.genActiveCode()
//   const obj = {
//     "from_address": fromMail,
//     "to_address": toMail,
//     "subject": subject,
//     "activation_code": code
//   }
//   let resSendmail = await idpService.sendmail(obj,'Bearer ' + req.session.assertion.id_token);
//   console.log("resSendmail: ", resSendmail)
//   res.send(resSendmail)
// });

// router.get('/getalluser',help.isAuthenticated, async (req, res, next) => {
//   const alluser = await idpService.callGetUser('Bearer ' + req.session.assertion.id_token)
//   let customData
//   if (alluser.result !== undefined) {
//     console.log("ERROR CALL API")
//     res.send(alluser)
//   } else {
//     console.log("PASS CALL API")
//     const customData = await help.customDataHaveEmail(alluser)
//     res.send(customData)
//   }
// })
router.get('/logout', function(req, res) {
  req.session.destroy(function(err){
     if(err){
        console.log(err);
     }else{
        //  console.log(req.session.user);
         res.redirect('/');
     }
  });
});

module.exports = router;
