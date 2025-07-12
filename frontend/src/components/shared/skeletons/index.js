// Base skeleton components
export { default as Skeleton } from '../Skeleton';
export { 
  TextSkeleton, 
  AvatarSkeleton, 
  ButtonSkeleton, 
  CardSkeleton, 
  InputSkeleton, 
  IconSkeleton, 
  StatSkeleton, 
  TabSkeleton, 
  TableSkeleton, 
  ListSkeleton, 
  FormSkeleton, 
  ModalSkeleton 
} from '../Skeleton';

// Component-specific skeletons
export { 
  LandingSkeleton,
  DashboardHeaderSkeleton,
  SidebarSkeleton,
  ClientDashboardSkeleton,
  ClientDashboardSkeleton as DashboardSkeleton,
  WorkerDashboardSkeleton,
  RequestDetailsSkeleton,
  PaymentCenterSkeleton,
  MessageCenterSkeleton,
  ProfileSkeleton,
  NotificationSkeleton,
  AuthFormSkeleton,
  ReviewSkeleton
} from '../ComponentSkeletons';

// Specialized skeletons
export {
  WorkerStatsSkeleton,
  PaymentHistorySkeleton,
  PaymentModalSkeleton,
  ServiceRequestCardSkeleton,
  ServiceRequestCardSkeleton as RequestCardSkeleton,
  WorkerCardSkeleton,
  ChatMessageSkeleton,
  ChatMessageSkeleton as MessageSkeleton,
  FileUploadSkeleton,
  SearchBarSkeleton,
  FilterPanelSkeleton,
  PaginationSkeleton,
  LoadingScreenSkeleton
} from '../SpecializedSkeletons';

// Skeleton hook for managing loading states
export { useSkeletonLoader } from './useSkeletonLoader';
