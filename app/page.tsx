import Image from "next/image";

export default function Home() {
  return (
    <main className="flex justify-center p-4">
      <div className="grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        <a
          href="https://github.com/yogesh0509"
          className="group rounded-lg border border-transparent px-7 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src={`/github.png`}
            width={300}
            height={300}
            alt="github"
            className='p-8'
          />
          <h2 className={`mb-3 text-2xl font-semibold`}>
            GitHub{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Find my GitHub profile which stores all the repositories in which I have worked.
          </p>
        </a>

        <a
          href="https://www.linkedin.com/in/yogesh0509/"
          className="group rounded-lg border border-transparent px-7 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src={`/linkedin.png`}
            width={300}
            height={300}
            alt="github"
            className='p-8'
          />

          <h2 className={`mb-3 text-2xl font-semibold`}>
            LinkedIn{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Visit my LinkedIn profile to connect with me.
          </p>
        </a>

        <a
          href="https://drive.google.com/file/d/1MuPnWQruBK_T1c1OJ_s0qMPVCY9ZoRac/view?usp=sharing"
          className="group rounded-lg border border-transparent px-7 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src={`/resume.png`}
            width={300}
            height={300}
            alt="github"
            className='p-8'
          />
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Resume{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Check out my professional resume
          </p>
        </a>

        <a
          href="./"
          className="group rounded-lg border border-transparent px-7 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src={`/portfolio.png`}
            width={300}
            height={300}
            alt="github"
            className='p-8'
          />
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Portfolio{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50 text-balance`}>
            Link to visit and explore my portfolio website.
          </p>
        </a>
      </div>
    </main>
  );
}
