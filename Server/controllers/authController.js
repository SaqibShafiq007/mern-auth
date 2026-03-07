import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../Config/nodemailer.js";
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from "../Config/emailTemplates.js";


export const registered = async(req,res) =>{

    const {name,email,password} =  req.body;

    if(!name||!email||!password){
        return res.json ({
            success:false,
            message : 'missing Details'
        })
    }

    try{

        const existingUser = await userModel.findOne({email})

        if(existingUser){
            return res.json ({
            success:false,
            message : 'User Already exist!'
        })
        }

        //if user not exist then store password
        const hasPassword = await bcrypt.hash(password,10);

        //create user for db
        const user = new userModel({name,email,password: hasPassword})

        await user.save()

        //genrate one taken for authentication(cookie)
        const token = JWT.sign(
            {id:user._id},
            process.env.JWT_SECRET,
            {expiresIn:'7d'}

        )

        
        //send this token to user in the response 
        res.cookie('token' , token , {
            httpOnly:true,
            secure : process.env.NODE_ENV ==='production',
            sameSite : process.env.NODE_ENV === 'production' ? 'none': 'strict',
            maxAge : 7*24*60*60*1000
        })



        //sending welcome mail

        const mailOptions = {
            from : process.env.SENDER_EMAIL,
            to : email , //get this from req.body
            subject:'welcome to GreatStack',
            text : `welcome to techStack web. Your account has been genereated successfully: ${email}`

        }
        await  transporter.sendMail(mailOptions);


        return res.json({ success: true });


    }
    catch(error){
        return res.json ({
            success:false,
            message : error.message
        })
    }






}


export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, message: 'Email and password are required' });
    }

    try {
        
        const user = await userModel.findOne({ email });

        // Check if user exists
        if (!user) {
            return res.json({ success: false, message: 'Invalid email' });
        }

        //Compare the typed password with the hashed password in DB
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid password' });
        }

        // Generate the JWT token (Missing in your draft)
        const token = JWT.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // Send cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({ success: true });

    }
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
}


export const logout = async (req,res)=>{

    try{

        
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return res.json({ success: true, message: "Logged Out" });

    }

    catch(error){
        return res.json({ success: false, message: error.message });
    }

}




export const sendVerifyOtp = async (req,res) =>{

    try {
        const {user_id} = req.body ;
        if(!user_id){
            return res.json({ 
                success: false,
                message: 'user id does not exist' 
            });
        }

        const user = await userModel.findById(user_id)

        if(user.isAccountVerified){
            return res.json({ 
                success: false,
                message: 'user already verified' 
            });

        }

        const otp = String(Math.floor((Math.random() * 900000 )+100000));

        

        user.verifyOtp = otp

        user.verifyOtpExpireAt = Date.now()+24*60*60*1000;
        await user.save();


        const mailOptions = {
            from : process.env.SENDER_EMAIL,
            to : user.email , //get this from req.body
            subject:'Otp for greatStack',
            //text : `Your Otp is : ${otp}`
            html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)

        }
        await  transporter.sendMail(mailOptions);


        return res.json({ success: true, message: 'Verification OTP Sent on Email' });



    
        
    } 
    catch(error){
        return res.json ({
            success:false,
            message : error.message
        })
    }


}



//when user get otp . he copy this and paste on app/web
//now chk if user entre the right otp or not

export const verifyEmail = async (req, res) => {
    try {
        const { user_id, otp } = req.body;

        if (!user_id || !otp) {
            return res.json({
                success: false,
                message: 'Missing Details' });
        }

        const user = await userModel.findById(user_id);

        if (!user) {
            return res.json({ success: false, message: 'User not found!' });
        }

        
        if (user.verifyOtp === '' || user.verifyOtp !== otp) {
            return res.json({ success: false, message: 'Invalid OTP!' });
        }

        // check if OTP has expired
        if (user.verifyOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: 'OTP Expired!' });
        }

        
        user.isAccountVerified = true; 
        user.verifyOtp = '';          
        user.verifyOtpExpireAt = 0;   

        await user.save(); 

        return res.json({ success: true, message: 'Email Verified Successfully' });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}


//now create 1 api that chk user is already login or not
export const isAuthenticated = async (req, res) => {
    try {
        
        return res.json({ success: true });
        
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}


export const sendResetOtp = async (req,res)=>{

    const {email} = req.body;

    if(!email){
        return res.json({
            success: false,
            message: 'Email is required!' 
        });
    }

    try {
        const user = await userModel.findOne({email});

        if(!user){
            return res.json({
            success: false,
            message: 'User is not found!' 
            });
        }


        const otp = String(Math.floor((Math.random() * 900000 )+100000));

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now()+ 15*60*1000;

        await user.save();

        const mailOptions = {
            from : process.env.SENDER_EMAIL,
            to : user.email , //get this from req.body
            subject:'Otp for reset password',
            //text : `Your Otp for reset password is : ${otp} `
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)

        }
        await  transporter.sendMail(mailOptions);

        return res.json({ success: true, message: 'OTP sent to your email' });



        
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }





}


//now user can verify otp and reset user passswprd

export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.json({ success: false, message: 'Email, OTP, and New Password are required.' });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: 'User not found!' });
        }

        if (user.resetOtp === '' || user.resetOtp !== otp) {
            return res.json({ success: false, message: 'Invalid OTP!' });
        }

        if (user.resetOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: 'OTP Expired!' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        user.resetOtp = '';
        user.resetOtpExpireAt = 0;

        await user.save();

        return res.json({ success: true, message: 'Your password has been reset successfully!' });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}













