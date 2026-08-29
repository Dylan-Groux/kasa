type ArrowUpIconProps = {
  className?: string;
};

export function ArrowUpIcon({ className }: ArrowUpIconProps) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M8 13.5C7.65482 13.5 7.375 13.2202 7.375 12.875V4.55584L4.19194 7.73891C3.94787 7.98298 3.55213 7.98298 3.30806 7.73891C3.06398 7.49484 3.06398 7.09909 3.30806 6.85502L7.55806 2.60502C7.80213 2.36095 8.19787 2.36095 8.44194 2.60502L12.6919 6.85502C12.936 7.09909 12.936 7.49484 12.6919 7.73891C12.4479 7.98298 12.0521 7.98298 11.8081 7.73891L8.625 4.55584V12.875C8.625 13.2202 8.34518 13.5 8 13.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
