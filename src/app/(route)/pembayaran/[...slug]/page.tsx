export default function Page({ params }: { params: { slug: string[] } }) {
  console.log(params.slug);
  return <h1>My Page</h1>;
}
