import { compare, genSalt, hash } from "bcrypt";
import mongoose,{Document} from "mongoose";

export interface Iuser extends Document{
    name:string;
    password:string;
    gmail:string;
    verify:boolean;
    tokens:string[]
    
    comparePassword(password: string): Promise<boolean>;
};

const userSchema= new mongoose.Schema <Iuser>({
    name:{
        type:String,
        require:true,
    },
    gmail:{
        type:String,
        require:true,
        unique:true
    },
    password:{
        type:String,
        require:true
    },
    verify:{
        type:Boolean,
        default:false
    },
    
    tokens:[String]
   
},{
    timestamps:true
})



userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = await genSalt(10);
    this.password = await hash(this.password, salt);
});


userSchema.methods.comparePassword=async function(password:string){
     return await compare(password,this.password)
}
;

export const UserModel=mongoose.model<Iuser>("User",userSchema);




