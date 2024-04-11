import { motion } from 'framer-motion';

export default function FormPopup({
  children,
  title,
  onClose,
}: {
  children: React.ReactNode;
  title: string;
  onClose: () => void;
}) {
  return (
    <>
      <motion.div
        className="absolute inset-0 z-10 bg-black/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />
      <motion.div
        className="absolute inset-0 z-10 overflow-y-auto"
        onClick={onClose}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ease: 'easeOut' }}
      >
        <div
          className="mx-auto my-6 w-full max-w-xl rounded-box bg-base-100 px-6 py-4 shadow-lg"
          onClick={(evt) => evt.stopPropagation()}
        >
          <h1 className="mb-6 text-2xl font-semibold">{title}</h1>
          {children}
        </div>
      </motion.div>
    </>
  );
}
