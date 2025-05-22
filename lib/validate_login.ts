import Cookies from "js-cookie";
export async function validate() {
    const logged = Cookies.get('auth_token')

    return !!logged; 
}