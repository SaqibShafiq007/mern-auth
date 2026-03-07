import jwt from "jsonwebtoken";


export const userAuth = async (req,res,next )=>{
    const {token} = req.cookies;

    if(!token){
        return res.json({
                success: false,
                message: 'npt authoried login again' });
        

    }


    try {

        const tokenDecode = jwt.verify(token , process.env.JWT_SECRET)
        
        if(tokenDecode.id){
            req.body = req.body || {};//you are telling the server: "If the body is missing, create an empty object so I can safely add the user_id to it.
            req.body.user_id = tokenDecode.id
        }
        else{
            return res.json({
                success: false,
                message: 'npt authoried login again' });
        

        }

        next();



    }  catch (error) {
        return res.json({ success: false, message: error.message });
    }
}
