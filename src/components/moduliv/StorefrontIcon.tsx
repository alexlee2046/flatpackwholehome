import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CreditCard,
  Factory,
  Gift,
  House,
  Lightbulb,
  MapPinHouse,
  Minimize2,
  Moon,
  Search,
  Ship,
  ShoppingCart,
  Store,
  Truck,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react'

const icons: Record<string, LucideIcon> = {
  arrow_downward: ArrowDown,
  arrow_back: ArrowLeft,
  arrow_forward: ArrowRight,
  check_circle: CheckCircle,
  chevron_left: ChevronLeft,
  chevron_right: ChevronRight,
  close: X,
  compress: Minimize2,
  credit_card: CreditCard,
  directions_boat: Ship,
  elevator: House,
  expand_more: ChevronDown,
  handyman: Wrench,
  home_pin: MapPinHouse,
  lightbulb: Lightbulb,
  local_shipping: Truck,
  nights_stay: Moon,
  precision_manufacturing: Factory,
  redeem: Gift,
  search: Search,
  shopping_cart: ShoppingCart,
  storefront: Store,
  task_alt: CircleCheck,
  verified: BadgeCheck,
}

export function StorefrontIcon({
  className,
  name,
  size = 20,
}: {
  className?: string
  name: string
  size?: number
}) {
  const Icon = icons[name] || CircleCheck
  return <Icon aria-hidden="true" className={className} size={size} strokeWidth={1.8} />
}
