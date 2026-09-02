import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <section aria-labelledby="home-title">
        <p>Industrial raw materials · Domestic supply · Export enquiries</p>
        <h1 id="home-title">Shreenathji Trade Links</h1>
        <p>
          Bulk mill scale, iron ore, carbon products, and industrial minerals.
        </p>
        <Link href="/request-a-quote">Request a Quote</Link>
      </section>
    </main>
  );
}
