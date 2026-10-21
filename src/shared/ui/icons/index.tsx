import type { ReactNode, SVGProps } from 'react';

export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number;
}

interface IconBaseProps extends IconProps {
    children: ReactNode;
}

const IconBase = ({ size = 18, children, ...props }: IconBaseProps) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        {...props}
    >
        {children}
    </svg>
);

export const UserIcon = (props: IconProps) => (
    <IconBase {...props}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </IconBase>
);

export const PhoneIcon = (props: IconProps) => (
    <IconBase {...props}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </IconBase>
);

export const UsersIcon = (props: IconProps) => (
    <IconBase {...props}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </IconBase>
);

export const CalendarIcon = (props: IconProps) => (
    <IconBase {...props}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </IconBase>
);

export const ClockIcon = (props: IconProps) => (
    <IconBase {...props}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </IconBase>
);

export const ChevronDownIcon = (props: IconProps) => (
    <IconBase {...props}>
        <polyline points="6 9 12 15 18 9" />
    </IconBase>
);

export const CheckIcon = (props: IconProps) => (
    <IconBase {...props}>
        <polyline points="20 6 9 17 4 12" />
    </IconBase>
);
