import Cards from "./Data/Cards"
import "./Frame.css"
export default function Frame() {
  return (
   <>
   <div className="Frame-box">
           <div className="Frame-heading">
     <h2>More Reasons to join</h2>
   </div>
   <div className="components">
     {Cards.map((value,i)=>{
        return(

           <div className="box" key={i}>
            <h3>{value.topic}</h3>
            <p>{value.content}</p>
            <img style={{width:"70px"}} src={value.image} alt="icon" />
           </div>  
        )
     })}
   </div>
   </div>
  
   </>
  )
}
