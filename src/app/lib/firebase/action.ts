import { auth } from "./firebase";
import { sendSignInLinkToEmail } from "firebase/auth";
import { db } from "./firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { redirect } from "next/navigation";
import { setEmailData } from "@/app/store/registerReducer";
import store from "@/app/store/store";

// export function useAuth() {
//   const [loading, setLoading] = useState(true);
//   const [user, setUser] = useState<User | null>(null);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       setUser(user);
//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, []);
//   return { user, loading };
// }

export async function signupWithFirebase(email: string) {
  console.log(db);
  try {
    const querySnapshot = await getDocs(
      query(collection(db, "users"), where("email", "==", email))
    );

    if (!querySnapshot.empty) {
      redirect("/login");
    }

    await sendSignInLinkToEmail(auth, email, {
      url: "http://localhost:3000/verification",
      handleCodeInApp: true,
    });

  } catch (error) {
    console.error(error);
  }
}
