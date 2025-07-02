import EditNewsPage from "@/app/(dashboard)/news/edit/[id]/EditNews";

export default function Page({params}:{params:{id:string}}){

    return <EditNewsPage id={params.id}/>
}