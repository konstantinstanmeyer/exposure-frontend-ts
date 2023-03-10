import axios from 'axios';
import { useRouter } from 'next/router';
import { ChangeEvent, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../src/store'
import validate from '@/util/validateUser';
import uploadToS3 from '@/util/uploadToS3'
import { resetPosts } from '@/features/post/postSlice';
import Loading from '@/components/Loading';

export default function SubmitPost(){
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState<any>("");
    const [sub, setSub] = useState<any>("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState<null | String>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const dispatch = useDispatch<AppDispatch>();

    const router = useRouter();

    const userState = useSelector((state: RootState) =>  state.auth.username);
    const tokenState = useSelector((state: RootState) =>  state.auth.token);

    useEffect(() => {
        if(!userState || !tokenState){
            if (!validate(dispatch)){
                router.push('/login')
            }
        }

        if (router.query.category && router.query.sub){
            const categoryInput = document.querySelector('#cat-input') as HTMLInputElement;
            const subInput = document.querySelector('#sub-input') as HTMLInputElement;
            
            categoryInput.disabled = true;
            subInput.disabled = true;
        }

        setCategory(router.query.category);
        setSub(router.query.sub);
    }, [router.isReady])

    async function handleSubmit(e: ChangeEvent<HTMLFormElement>){
        e.preventDefault();
        setIsLoading(true);

        try {
            const key = await uploadToS3(e);
            // console.log(key);

            const response = await axios.post(process.env.NEXT_PUBLIC_DB_URL + 'post', {
                title: title,
                category: category,
                subCategory: sub,
                description: description,
                imageUrl: "https://exposure-s3-bucket.s3.amazonaws.com/" + key
            }, { headers: { "Authorization": "Bearer " + localStorage.getItem('token')}});

            if (response.status === 200){
                dispatch(resetPosts())
                console.log("yes")
                router.push(`/category/sub/${sub}?category=${category}`)
            } else {
                setIsLoading(false);
            }

            console.log(response);
        } catch(e: any){
            setError(e.message);
            setIsLoading(false);
        }
    }

    return (
        <div className="">
            {!isLoading ? <form className="mt-32 w-1/4 mx-auto flex flex-col justify-center" onSubmit={handleSubmit}>
                <div className="w-1/3 mx-auto relative my-8 flex justify-center">
                    <input className="rounded-md indent-3 py-2 !outline-none" type="text" value={title} onChange={e => setTitle(e.target.value)} name="category" />
                    <p className="absolute -top-[1.3rem] left-[0.15rem] text-sm text-gray-300">title</p>
                </div>
                <div className="w-1/3 mx-auto relative my-8 flex justify-center">
                    <input className="rounded-md indent-3 py-2 !outline-none" id="cat-input" type="text" value={category} onChange={e => setCategory(e.target.value)} name="category" />
                    <p className="absolute -top-[1.3rem] left-[0.15rem] text-sm text-gray-300">category</p>
                </div>
                <div className="w-1/3 mx-auto relative my-8 flex justify-center">
                    <input className="rounded-md indent-3 py-2 !outline-none" id="sub-input" type="text" value={sub} onChange={e => setSub(e.target.value)} name="category" />
                    <p className="absolute -top-[1.3rem] left-[0.15rem] text-sm text-gray-300">sub-category</p>
                </div>
                <div className="w-1/3 mx-auto relative my-8 flex justify-center">
                    <textarea placeholder="..." className="rounded-md py-2 px-3 bg-gray-200 !outline-none" value={description} onChange={e => setDescription(e.target.value)} name="description" />
                    <p className="absolute -top-[1.3rem] left-[0.15rem] text-sm text-gray-300">description</p>
                </div>
                <div className="w-2/3 mx-auto bg-gray-300/10 rounded-lg py-5 px-2 flex justify-center mt-4">
                    <input className="mx-auto w-3/4 text-gray-300 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-500 file:text-gray-900" type="file" accept="image/jpeg image/png" name="file"/>
                </div>
                <button className="w-1/5 py-1 rounded-full mx-auto my-8 text-md bg-gray-500 hover:bg-gray-700 transition-all duration-300" type="submit">submit</button>
            </form>: 
            <Loading />
            }
            {error ? 
            <div className="fixed w-1/5 bg-red-700 rounded-lg h-fit z-40 mx-auto left-[40%] bottom-10">
                <p className="text-center mx-6 py-3 font-bold font-mono select-none">{error}</p>
                <p onClick={() => setError(null)} className="absolute top-1 right-3 rotate-45 font-bold text-xl hover:cursor-pointer">+</p>
            </div>
            : null }
        </div>
    )
}

{/* <form onSubmit={handleSubmit}>
    <input type="file" accept="image/jpeg image/png" name="file"/>
    <input type="text" value={genre} onChange={e => setGenre(e.target.value)} name="genre" />
    <input type="text" value={category} onChange={e => setCategory(e.target.value)} name="category" />
    <input type="text" value={description} onChange={e => setDescription(e.target.value)} name="description" />
    <button type="submit">Submit</button>
</form> */}