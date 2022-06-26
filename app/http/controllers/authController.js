const User=require('../../models/user');
const bcrypt=require('bcrypt');
const passport = require('passport');
const session=require('express-session')
function authController(){
    return {
        login(req,res){
            // logic
            res.render('auth/login')
        },
        postLogin(req,res,next){
            const {email,password}=req.body
            if(!email || !password){
                req.flash('error','* All fields are required')
                return res.redirect('/login')
            }
            passport.authenticate('local',(err,user,info)=>{
                if(err){
                    req.flash('error',info.message)
                    return next(err)
                }
                if(!user){
                    req.flash('error',info.message)
                    return res.redirect('/login')
                }
                req.logIn(user,(err)=>{
                    if(err){
                        req.flash('error',info.message)
                        return next(err)
                    }
                    return res.redirect('/')
                })
            })(req,res,next)
        },
        register(req,res){
            // logic
            res.render('auth/register')
        },
        async postRegister(req,res){
            const {name,email,password}=req.body
            //Validate request
            if(!name || !email || !password){
                req.flash('error','* All fields are required')
                req.flash('name',name)
                req.flash('email',email)
                return res.redirect('/register')
            }
            //Check if email exists
            User.exists({email: email},(err,result)=>{
                if(result){
                    req.flash('error','This email is already registered')
                    req.flash('name',name)
                    return res.redirect('/register')
                }
            })
            //Hash password
            const hashedPassword=await bcrypt.hash(password, 10)
            //Create a user
            const user=new User({
                name: name,
                email: email,
                password: hashedPassword
            });
            user.save().then((user)=>{
                //Login

                return res.redirect('/')
            })
        },
        logout(req,res,next){
            req.logout((err)=>{
                if(err){
                    return next(err);
                }
            })
            return res.redirect('/login')
        }
    }
}
module.exports=authController;