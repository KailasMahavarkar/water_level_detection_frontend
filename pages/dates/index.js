import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useEffectAsync } from "../../helper";

const SingleDateViewPage = () => {
    const [date, setDate ] = useState(null); 
    const router = useRouter()

    
    useEffectAsync(() => {
        if (!router.isReady) return;
        const { date } = router.query;
        setDate(date);
    }, [router.isReady])



    return (
        <div>singleDateViewPage</div>
    )
}

export default SingleDateViewPage