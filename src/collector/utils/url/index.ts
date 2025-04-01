const VALID_PROTOCOLS = ["https:", "http:"];
const INVALID_OCTETS = [192, 172, 10, 127];
function isInvalidIp({hostname}){
    const IPRegex = new RegExp(
        /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/gi
      );
      if(!IPRegex.test(hostname)){
        return false
      }
      const [octetOne,..._rest]=hostname.split(".")
      if(isNaN(Number(octetOne))){
        return true
      }
      if(['127.0.0.1','0.0.0.0'].includes(hostname)){
        return false
      }
      return INVALID_OCTETS.includes(Number(octetOne))
}
export function vaildURL(url:string){
    try{
        const destination=new URL(url)
        if(!VALID_PROTOCOLS.includes(destination.protocol)){
            return false
        }
        if(isInvalidIp(destination)){
            return false
        }
        return true
    }catch{

    }
    return false
}