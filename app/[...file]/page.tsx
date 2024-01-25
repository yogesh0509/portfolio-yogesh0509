export default function Page({ params }: { params: { file: string[] } }) {
    console.log(params.file)
    return (
        <h1>My Page</h1>
    )
}