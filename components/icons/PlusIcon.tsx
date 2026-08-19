type PlusIconProps = {
  className?: string;
};

export function PlusIcon({ className }: PlusIconProps) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 19 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M9.5 2.96875C9.82792 2.96875 10.0938 3.23458 10.0938 3.5625V8.90625H15.4375C15.7654 8.90625 16.0312 9.17208 16.0312 9.5C16.0312 9.82792 15.7654 10.0938 15.4375 10.0938H10.0938V15.4375C10.0938 15.7654 9.82792 16.0312 9.5 16.0312C9.17208 16.0312 8.90625 15.7654 8.90625 15.4375V10.0938H3.5625C3.23458 10.0938 2.96875 9.82792 2.96875 9.5C2.96875 9.17208 3.23458 8.90625 3.5625 8.90625H8.90625V3.5625C8.90625 3.23458 9.17208 2.96875 9.5 2.96875Z"
        fill="currentColor"
      />
    </svg>
  );
}
