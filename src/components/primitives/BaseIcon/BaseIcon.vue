<!--
=============================================================================
 MASES Phase 2 UI — BaseIcon
=============================================================================

 File:      mase_app/src/components/primitives/BaseIcon/BaseIcon.vue
 Layer:     1 (Primitives)
 Version:   2.0.0
 Status:    FROZEN
 Authority: MASES_PHASE_2_UI_COMPONENT_CATALOG.md §2.19
            MASES_PHASE_2_UI_DESIGN_SYSTEM.md v1.0.0

 -----------------------------------------------------------------------------
 Purpose
 -----------------------------------------------------------------------------
 Renders a Lucide icon from a frozen, statically-imported registry.

   - TypeScript-safe `name` prop (IconName union derived from ICONS).
   - Size resolves through Tier 2 CSS variables (`--mases-icon-*`) with
     pixel fallbacks so the primitive is correct even when tokens are
     not yet loaded (SSR, isolated storybook, test environment).
   - Stroke weight per size, frozen by Design System §7.4.
   - Color accepts Tier 2 token names, `--mases-*` var names, CSS-wide
     keywords, `currentColor`, and any CSS color the runtime browser
     understands (hex / rgb / hsl / hwb / lab / lch / oklab / oklch /
     color() / named colors).
   - Correct accessibility semantics (decorative by default; role="img"
     + aria-label when `ariaLabel` is supplied).
   - Missing icons render a layout-preserving placeholder rather than
     collapsing the surrounding layout, and warn in development.

 -----------------------------------------------------------------------------
 Registry
 -----------------------------------------------------------------------------
 The registry (ICONS) is the implementation of Component Catalog §10.
 The set is closed: adding an icon is a Change Request that modifies
 ICONS below and updates the catalog. Consumers cannot register icons
 at the call site. A name that is not a key of ICONS produces a
 TypeScript error at compile time.

 -----------------------------------------------------------------------------
 Size mapping — CSS-variable-first
 -----------------------------------------------------------------------------
 Each size resolves to `var(--mases-icon-<size>, <fallback>px)`:

   xs  → --mases-icon-xs   12px   stroke 1.75
   sm  → --mases-icon-sm   16px   stroke 1.75
   md  → --mases-icon-md   20px   stroke 2      (default)
   lg  → --mases-icon-lg   24px   stroke 2
   xl  → --mases-icon-xl   32px   stroke 2
   2xl → --mases-icon-2xl  48px   stroke 1.5
   3xl → --mases-icon-3xl  64px   stroke 1.5
   4xl → --mases-icon-4xl  96px   stroke 1.5

 The pixel values are fallbacks, not the source of truth. When the
 Design System retunes `--mases-icon-md`, every BaseIcon follows. The
 fallback exists only so that the primitive is correct in contexts
 where the token stylesheet is not yet applied.

 Arbitrary pixel sizes are not supported. New sizes are added by a
 Change Request to the Design System (§14.2), which registers the
 token and the fallback here.

 -----------------------------------------------------------------------------
 Stroke weight rationale (Design System §7.4 — frozen)
 -----------------------------------------------------------------------------
 1.75px for xs/sm — a 2px stroke is visually heavy at 12–16px and
                    erodes the recognizable silhouette of the glyph.
 2.00px for md/lg/xl — canonical Lucide weight.
 1.50px for 2xl/3xl/4xl — a 2px stroke is coarse and blocky at large
                    sizes; 1.5px preserves curve fidelity.

 These values are NOT derived from tokens. They are the correct
 optical corrections for the Lucide glyph set at those sizes and are
 frozen by the Design System.

 -----------------------------------------------------------------------------
 Color resolution (order of precedence)
 -----------------------------------------------------------------------------
 1. undefined / empty        → currentColor
 2. 'currentColor'           → currentColor
 3. starts with '--'         → var(<value>)              (explicit var)
 4. CSS-wide keyword         → pass through               (inherit, initial,
                                                           unset, revert,
                                                           revert-layer,
                                                           transparent)
 5. Runtime CSS color        → pass through               (via CSS.supports
                                                           in the browser;
                                                           regex in SSR)
 6. Anything else            → var(--mases-<value>)       (Tier 2 token)

 Note: a token whose name collides with a valid CSS color (e.g. a
 hypothetical token literally named "red") loses to CSS. This is
 intentional — the CSS value is the more likely intent. Token names
 must use hyphenated MASES conventions (e.g. `color-icon-primary`).

 -----------------------------------------------------------------------------
 Accessibility
 -----------------------------------------------------------------------------
 Decorative (ariaLabel omitted) — DEFAULT and CORRECT for the vast
 majority of uses (button icons, form field adornments, list icons,
 table cell icons). aria-hidden="true"; removed from the a11y tree.

 Informative (ariaLabel provided) — role="img" + aria-label. Use only
 when the icon is the SOLE carrier of meaning (status glyph with no
 adjacent text, icon-only toolbar button whose label is on the parent).

 -----------------------------------------------------------------------------
 Test hooks
 -----------------------------------------------------------------------------
 data-testid="base-icon-root"
 data-icon-name="<name>"
 data-size="<size>"
 data-icon-resolved-size="<px>"
 data-icon-missing="true"      (present only on the placeholder branch)

 -----------------------------------------------------------------------------
 Bundle consideration
 -----------------------------------------------------------------------------
 The full registry adds roughly 160–220 KB (minified, pre-gzip) to the
 bundle, roughly 50–70 KB gzipped. This is a deliberate, bounded cost
 accepted by the design system to give the UI a single, consistent,
 first-party icon set. It is not configurable at the consumer level.
 A future CR that reduces the registry reduces this cost proportionally.
 Tree-shaking is preserved at the module boundary: consumers that do
 not import BaseIcon do not pay for the registry.
=============================================================================
-->

<script lang="ts">
/*
 * Frozen registry of Lucide icons used by the MASES Phase 2 UI.
 *
 * Consumers receive the union type IconName (below) which restricts the
 * `name` prop to the keys of ICONS. Adding an icon requires a Change
 * Request that modifies this object and updates the catalog.
 */
import {
  // ── Core UI ────────────────────────────────────────────────────────
  Check, X, Plus, Minus,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  ChevronsDown, ChevronsUp, ChevronsLeft, ChevronsRight,
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown,
  ArrowUpLeft, ArrowUpRight, ArrowDownLeft, ArrowDownRight,
  ExternalLink, Search, Filter, SlidersHorizontal,
  MoreHorizontal, MoreVertical, Menu, GripVertical, Command,
  CornerDownLeft, CornerDownRight, CornerUpLeft, CornerUpRight,
  // ── Status ─────────────────────────────────────────────────────────
  Info, AlertTriangle, AlertCircle, AlertOctagon,
  CheckCircle, CheckCircle2, XCircle,
  Loader, Loader2, Circle, CircleDot, CircleSlash, Ban,
  Bell, BellOff, BellRing,
  // ── Navigation ─────────────────────────────────────────────────────
  Home, LayoutGrid, LayoutList, LayoutDashboard,
  Folder, FolderOpen, FolderPlus, FolderMinus,
  File as FileIcon, FileText, FilePlus, FileCheck, FileX, FileSearch,
  Image as ImageIcon, Paperclip, Download, Upload,
  Eye, EyeOff, Compass, Map, MapPin, Navigation, Route,
  // ── Users ──────────────────────────────────────────────────────────
  User, Users, UserPlus, UserMinus, UserCheck, UserX, UserCog, UserCircle, Contact,
  // ── Communication ──────────────────────────────────────────────────
  Mail, MailOpen, Phone, PhoneCall, PhoneOff,
  MessageCircle, MessageSquare, Send, Inbox, AtSign, Megaphone, Rss,
  // ── Finance / Domain ───────────────────────────────────────────────
  DollarSign, Euro, PoundSterling, Wallet, Coins, Receipt,
  CreditCard, Banknote, PiggyBank, TrendingUp, TrendingDown,
  LineChart, BarChart, BarChart2, BarChart3, PieChart, Activity, Percent,
  Tag, Tags, ShoppingCart, ShoppingBag, CircleDollarSign,
  Landmark, Building, Building2, Warehouse, Factory, Store,
  Handshake, Briefcase, Calculator,
  // ── Time ───────────────────────────────────────────────────────────
  Calendar, CalendarDays, CalendarCheck, CalendarX, CalendarClock,
  Clock, Timer, AlarmClock, Hourglass, History, Watch,
  // ── Security ───────────────────────────────────────────────────────
  Shield, ShieldCheck, ShieldAlert, ShieldX, ShieldOff,
  Lock, LockOpen, Unlock, Key, KeyRound, Fingerprint, Scan, QrCode,
  // ── Editing ────────────────────────────────────────────────────────
  Edit, Edit2, Edit3, Pencil, PenTool,
  Copy, Clipboard, ClipboardCheck, ClipboardList, ClipboardX,
  Trash, Trash2, Save, Undo, Redo, Eraser, Paintbrush, Palette,
  // ── Files / Media / Devices ────────────────────────────────────────
  Archive, Package, Box, Boxes, HardDrive, Database, Server,
  Cloud, CloudOff, CloudUpload, CloudDownload,
  Wifi, WifiOff, Bluetooth, Cpu, Monitor, Smartphone, Tablet, Laptop,
  Keyboard, Mouse, Printer, Camera, Video, Mic, MicOff,
  Headphones, Speaker, Volume, Volume1, Volume2, VolumeX,
  Play, Pause, Square, SkipBack, SkipForward, Rewind, FastForward,
  Repeat, Shuffle, Music, Radio,
  // ── Move / Arrows ──────────────────────────────────────────────────
  Move, MoveHorizontal, MoveVertical,
  Expand, Shrink, Maximize, Minimize, Maximize2, Minimize2,
  Focus, Crosshair, Target, Locate,
  // ── Misc / Weather / Nature ────────────────────────────────────────
  Star, Heart, Bookmark, Flag, Hash, Link, Link2, Unlink, Share, Share2, Anchor,
  Zap, ZapOff, Sparkles, Flame, Snowflake, Sun, Moon,
  CloudSun, CloudRain, Wind, Droplet, Droplets, Umbrella, Thermometer, Waves,
  Mountain, Leaf, Bug, Bird, Fish,
  // ── Awards / Books ─────────────────────────────────────────────────
  Award, Trophy, Medal, Crown, Gem, Diamond, Badge, BadgeCheck,
  GraduationCap, BookOpen, Book,
  // ── Toggles / Layout ───────────────────────────────────────────────
  ToggleLeft, ToggleRight, Power, PowerOff, CheckSquare, CheckCheck,
  Layout, Columns, Rows, Grid2x2, Grid3x3,
  Table, List, ListChecks, ListOrdered, ListTodo,
  Layers, Layers2, Layers3, Component, Puzzle, Blocks,
  // ── Science / Globe ────────────────────────────────────────────────
  TestTube, TestTube2, Beaker, FlaskConical, Microscope, Atom, Rocket,
  Globe, Globe2,
} from 'lucide-vue-next';

export const ICONS = {
  // ── Core UI ────────────────────────────────────────────────────────
  'check':             Check,
  'close':             X,
  'plus':              Plus,
  'minus':             Minus,
  'chevron-down':      ChevronDown,
  'chevron-up':        ChevronUp,
  'chevron-left':      ChevronLeft,
  'chevron-right':     ChevronRight,
  'chevrons-down':     ChevronsDown,
  'chevrons-up':       ChevronsUp,
  'chevrons-left':     ChevronsLeft,
  'chevrons-right':    ChevronsRight,
  'arrow-left':        ArrowLeft,
  'arrow-right':       ArrowRight,
  'arrow-up':          ArrowUp,
  'arrow-down':        ArrowDown,
  'arrow-up-left':     ArrowUpLeft,
  'arrow-up-right':    ArrowUpRight,
  'arrow-down-left':   ArrowDownLeft,
  'arrow-down-right':  ArrowDownRight,
  'external-link':     ExternalLink,
  'search':            Search,
  'filter':            Filter,
  'sliders':           SlidersHorizontal,
  'more-horizontal':   MoreHorizontal,
  'more-vertical':     MoreVertical,
  'menu':              Menu,
  'grip-vertical':     GripVertical,
  'command':           Command,
  'corner-down-left':  CornerDownLeft,
  'corner-down-right': CornerDownRight,
  'corner-up-left':    CornerUpLeft,
  'corner-up-right':   CornerUpRight,

  // ── Status ─────────────────────────────────────────────────────────
  'info':              Info,
  'alert-triangle':    AlertTriangle,
  'alert-circle':      AlertCircle,
  'alert-octagon':     AlertOctagon,
  'check-circle':      CheckCircle,
  'check-circle-2':    CheckCircle2,
  'x-circle':          XCircle,
  'loader':            Loader,
  'loader-spinner':    Loader2,
  'circle':            Circle,
  'circle-dot':        CircleDot,
  'circle-slash':      CircleSlash,
  'ban':               Ban,
  'bell':              Bell,
  'bell-off':          BellOff,
  'bell-ring':         BellRing,

  // ── Navigation ─────────────────────────────────────────────────────
  'home':              Home,
  'layout-grid':       LayoutGrid,
  'layout-list':       LayoutList,
  'layout-dashboard':  LayoutDashboard,
  'folder':            Folder,
  'folder-open':       FolderOpen,
  'folder-plus':       FolderPlus,
  'folder-minus':      FolderMinus,
  'file':              FileIcon,
  'file-text':         FileText,
  'file-plus':         FilePlus,
  'file-check':        FileCheck,
  'file-x':            FileX,
  'file-search':       FileSearch,
  'image':             ImageIcon,
  'paperclip':         Paperclip,
  'download':          Download,
  'upload':            Upload,
  'eye':               Eye,
  'eye-off':           EyeOff,
  'compass':           Compass,
  'map':               Map,
  'map-pin':           MapPin,
  'navigation':        Navigation,
  'route':             Route,

  // ── Users ──────────────────────────────────────────────────────────
  'user':              User,
  'users':             Users,
  'user-plus':         UserPlus,
  'user-minus':        UserMinus,
  'user-check':        UserCheck,
  'user-x':            UserX,
  'user-cog':          UserCog,
  'user-circle':       UserCircle,
  'contact':           Contact,

  // ── Communication ──────────────────────────────────────────────────
  'mail':              Mail,
  'mail-open':         MailOpen,
  'phone':             Phone,
  'phone-call':        PhoneCall,
  'phone-off':         PhoneOff,
  'message-circle':    MessageCircle,
  'message-square':    MessageSquare,
  'send':              Send,
  'inbox':             Inbox,
  'at-sign':           AtSign,
  'megaphone':         Megaphone,
  'rss':               Rss,

  // ── Finance / Domain ───────────────────────────────────────────────
  'dollar-sign':       DollarSign,
  'euro':              Euro,
  'pound-sterling':    PoundSterling,
  'wallet':            Wallet,
  'coins':             Coins,
  'receipt':           Receipt,
  'credit-card':       CreditCard,
  'banknote':          Banknote,
  'piggy-bank':        PiggyBank,
  'trending-up':       TrendingUp,
  'trending-down':     TrendingDown,
  'line-chart':        LineChart,
  'bar-chart':         BarChart,
  'bar-chart-2':       BarChart2,
  'bar-chart-3':       BarChart3,
  'pie-chart':         PieChart,
  'activity':          Activity,
  'percent':           Percent,
  'tag':               Tag,
  'tags':              Tags,
  'shopping-cart':     ShoppingCart,
  'shopping-bag':      ShoppingBag,
  'circle-dollar-sign': CircleDollarSign,
  'landmark':          Landmark,
  'building':          Building,
  'building-2':        Building2,
  'warehouse':         Warehouse,
  'factory':           Factory,
  'store':             Store,
  'handshake':         Handshake,
  'briefcase':         Briefcase,
  'calculator':        Calculator,

  // ── Time ───────────────────────────────────────────────────────────
  'calendar':          Calendar,
  'calendar-days':     CalendarDays,
  'calendar-check':    CalendarCheck,
  'calendar-x':        CalendarX,
  'calendar-clock':    CalendarClock,
  'clock':             Clock,
  'timer':             Timer,
  'alarm-clock':       AlarmClock,
  'hourglass':         Hourglass,
  'history':           History,
  'watch':             Watch,

  // ── Security ───────────────────────────────────────────────────────
  'shield':            Shield,
  'shield-check':      ShieldCheck,
  'shield-alert':      ShieldAlert,
  'shield-x':          ShieldX,
  'shield-off':        ShieldOff,
  'lock':              Lock,
  'lock-open':         LockOpen,
  'unlock':            Unlock,
  'key':               Key,
  'key-round':         KeyRound,
  'fingerprint':       Fingerprint,
  'scan':              Scan,
  'qr-code':           QrCode,

  // ── Editing ────────────────────────────────────────────────────────
  'edit':              Edit,
  'edit-2':            Edit2,
  'edit-3':            Edit3,
  'pencil':            Pencil,
  'pen-tool':          PenTool,
  'copy':              Copy,
  'clipboard':         Clipboard,
  'clipboard-check':   ClipboardCheck,
  'clipboard-list':    ClipboardList,
  'clipboard-x':       ClipboardX,
  'trash':             Trash,
  'trash-2':           Trash2,
  'save':              Save,
  'undo':              Undo,
  'redo':              Redo,
  'eraser':            Eraser,
  'paintbrush':        Paintbrush,
  'palette':           Palette,

  // ── Files / Media / Devices ────────────────────────────────────────
  'archive':           Archive,
  'package':           Package,
  'box':               Box,
  'boxes':             Boxes,
  'hard-drive':        HardDrive,
  'database':          Database,
  'server':            Server,
  'cloud':             Cloud,
  'cloud-off':         CloudOff,
  'cloud-upload':      CloudUpload,
  'cloud-download':    CloudDownload,
  'wifi':              Wifi,
  'wifi-off':          WifiOff,
  'bluetooth':         Bluetooth,
  'cpu':               Cpu,
  'monitor':           Monitor,
  'smartphone':        Smartphone,
  'tablet':            Tablet,
  'laptop':            Laptop,
  'keyboard':          Keyboard,
  'mouse':             Mouse,
  'printer':           Printer,
  'camera':            Camera,
  'video':             Video,
  'mic':               Mic,
  'mic-off':           MicOff,
  'headphones':        Headphones,
  'speaker':           Speaker,
  'volume':            Volume,
  'volume-1':          Volume1,
  'volume-2':          Volume2,
  'volume-x':          VolumeX,
  'play':              Play,
  'pause':             Pause,
  'square':            Square,
  'skip-back':         SkipBack,
  'skip-forward':      SkipForward,
  'rewind':            Rewind,
  'fast-forward':      FastForward,
  'repeat':            Repeat,
  'shuffle':           Shuffle,
  'music':             Music,
  'radio':             Radio,

  // ── Move / Arrows ──────────────────────────────────────────────────
  'move':              Move,
  'move-horizontal':   MoveHorizontal,
  'move-vertical':     MoveVertical,
  'expand':            Expand,
  'shrink':            Shrink,
  'maximize':          Maximize,
  'minimize':          Minimize,
  'maximize-2':        Maximize2,
  'minimize-2':        Minimize2,
  'focus':             Focus,
  'crosshair':         Crosshair,
  'target':            Target,
  'locate':            Locate,

  // ── Misc / Weather / Nature ────────────────────────────────────────
  'star':              Star,
  'heart':             Heart,
  'bookmark':          Bookmark,
  'flag':              Flag,
  'hash':              Hash,
  'link':              Link,
  'link-2':            Link2,
  'unlink':            Unlink,
  'share':             Share,
  'share-2':           Share2,
  'anchor':            Anchor,
  'zap':               Zap,
  'zap-off':           ZapOff,
  'sparkles':          Sparkles,
  'flame':             Flame,
  'snowflake':         Snowflake,
  'sun':               Sun,
  'moon':              Moon,
  'cloud-sun':         CloudSun,
  'cloud-rain':        CloudRain,
  'wind':              Wind,
  'droplet':           Droplet,
  'droplets':          Droplets,
  'umbrella':          Umbrella,
  'thermometer':       Thermometer,
  'waves':             Waves,
  'mountain':          Mountain,
  'leaf':              Leaf,
  'bug':               Bug,
  'bird':              Bird,
  'fish':              Fish,

  // ── Awards / Books ─────────────────────────────────────────────────
  'award':             Award,
  'trophy':            Trophy,
  'medal':             Medal,
  'crown':             Crown,
  'gem':               Gem,
  'diamond':           Diamond,
  'badge':             Badge,
  'badge-check':       BadgeCheck,
  'graduation-cap':    GraduationCap,
  'book-open':         BookOpen,
  'book':              Book,

  // ── Toggles / Layout ───────────────────────────────────────────────
  'toggle-left':       ToggleLeft,
  'toggle-right':      ToggleRight,
  'power':             Power,
  'power-off':         PowerOff,
  'check-square':      CheckSquare,
  'check-check':       CheckCheck,
  'layout':            Layout,
  'columns':           Columns,
  'rows':              Rows,
  'grid-2x2':          Grid2x2,
  'grid-3x3':          Grid3x3,
  'table':             Table,
  'list':              List,
  'list-checks':       ListChecks,
  'list-ordered':      ListOrdered,
  'list-todo':         ListTodo,
  'layers':            Layers,
  'layers-2':          Layers2,
  'layers-3':          Layers3,
  'component':         Component,
  'puzzle':            Puzzle,
  'blocks':            Blocks,

  // ── Science / Globe ────────────────────────────────────────────────
  'test-tube':         TestTube,
  'test-tube-2':       TestTube2,
  'beaker':            Beaker,
  'flask':             FlaskConical,
  'microscope':        Microscope,
  'atom':              Atom,
  'rocket':            Rocket,
  'globe':             Globe,
  'globe-2':           Globe2,
} as const;

/** The set of icon names this primitive accepts. */
export type IconName = keyof typeof ICONS;

/** Convenience array for consumers that need to enumerate the registry. */
export const ICON_NAMES = Object.keys(ICONS) as readonly IconName[];

/** Runtime type guard. */
export function isIconName(value: unknown): value is IconName {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(ICONS, value);
}
</script>

<script setup lang="ts">
import { computed, watch } from 'vue';

/* ────────────────────────────────────────────────────────────────────────
 * Public types
 * ──────────────────────────────────────────────────────────────────────── */

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

/**
 * A Tier 2 token name (e.g. `color-icon-primary`) or any CSS color the
 * runtime understands. Kept as `string` deliberately: a template-literal
 * union would fight legitimate uses (data-driven colors from a payload,
 * user-provided CSS variables, etc.) and provides little safety in
 * practice.
 */
export type IconColor = string;

interface Props {
  /** Icon name — one of the frozen registry keys. */
  name: IconName;
  /** Size. Defaults to 'md'. */
  size?: IconSize;
  /** Color. See the file header §"Color resolution". */
  color?: IconColor;
  /**
   * Accessible name. When omitted the icon is decorative
   * (aria-hidden="true"). When provided the icon is informative
   * (role="img" + aria-label).
   */
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: undefined,
  ariaLabel: undefined,
});

/* ────────────────────────────────────────────────────────────────────────
 * Size table — pixel values are FALLBACKS; tokens take precedence.
 * ──────────────────────────────────────────────────────────────────────── */

interface SizeSpec {
  /** Fallback pixel size used only when `--mases-icon-<size>` is undefined. */
  readonly px: number;
  /** Frozen stroke weight (Design System §7.4). */
  readonly stroke: number;
  /** Tier 2 token name. */
  readonly token: string;
}

const SIZE_MAP: Readonly<Record<IconSize, SizeSpec>> = Object.freeze({
  'xs':  { px: 12, stroke: 1.75, token: '--mases-icon-xs'  },
  'sm':  { px: 16, stroke: 1.75, token: '--mases-icon-sm'  },
  'md':  { px: 20, stroke: 2,    token: '--mases-icon-md'  },
  'lg':  { px: 24, stroke: 2,    token: '--mases-icon-lg'  },
  'xl':  { px: 32, stroke: 2,    token: '--mases-icon-xl'  },
  '2xl': { px: 48, stroke: 1.5,  token: '--mases-icon-2xl' },
  '3xl': { px: 64, stroke: 1.5,  token: '--mases-icon-3xl' },
  '4xl': { px: 96, stroke: 1.5,  token: '--mases-icon-4xl' },
});

/* ────────────────────────────────────────────────────────────────────────
 * Resolved size — defends against invalid values arriving at runtime
 * (widened strings from v-bind, JSON payloads, <component :is>).
 * ──────────────────────────────────────────────────────────────────────── */

const resolvedSizeKey = computed<IconSize>(() => {
  if (Object.prototype.hasOwnProperty.call(SIZE_MAP, props.size)) {
    return props.size;
  }
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn(
      `[BaseIcon] unknown size "${String(props.size)}". ` +
        `Falling back to "md". Valid sizes: ${Object.keys(SIZE_MAP).join(', ')}.`,
    );
  }
  return 'md';
});

const sizeSpec = computed<SizeSpec>(() => SIZE_MAP[resolvedSizeKey.value]);
const fallbackPx = computed<number>(() => sizeSpec.value.px);
const resolvedStrokeWidth = computed<number>(() => sizeSpec.value.stroke);

/* ────────────────────────────────────────────────────────────────────────
 * Color resolution
 * ──────────────────────────────────────────────────────────────────────── */

const CSS_WIDE_KEYWORDS = new Set<string>([
  'inherit',
  'initial',
  'unset',
  'revert',
  'revert-layer',
  'transparent',
]);

/** Function-form CSS color syntaxes we recognise in the SSR fallback. */
const CSS_COLOR_FUNCTION_RE =
  /^(rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color|color-mix|light-dark)\(/i;

/**
 * Returns true if the browser considers `value` a valid CSS color.
 *
 * In the browser we defer to `CSS.supports`, which handles every current
 * and future CSS color syntax automatically. In SSR (or in environments
 * without the CSSOM) we fall back to a conservative regex that covers
 * hex, the standard function syntaxes, CSS-wide keywords, and
 * `currentColor`.
 */
function isCssColor(value: string): boolean {
  if (value === 'currentColor') return true;
  if (CSS_WIDE_KEYWORDS.has(value)) return true;
  if (value.startsWith('#')) return true;
  if (CSS_COLOR_FUNCTION_RE.test(value)) return true;

  if (typeof CSS !== 'undefined' && typeof CSS.supports === 'function') {
    try {
      return CSS.supports('color', value);
    } catch {
      return false;
    }
  }
  return false;
}

const resolvedColor = computed<string>(() => {
  const value = props.color;

  // 1. Unset → inherit from parent (the default, and the reason icons
  //    inside a PrimaryButton pick up the button's text color).
  if (value === undefined || value === '') return 'currentColor';

  // 2. Explicit CSS variable reference.
  if (value.startsWith('--')) return `var(${value})`;

  // 3-5. Anything the runtime recognises as a color wins.
  if (isCssColor(value)) return value;

  // 6. Fallback: assume a Tier 2 MASES token name. An unknown token
  //    produces an undefined variable; the browser falls back to the
  //    inherited color, so the icon remains visible. A dev warning is
  //    emitted below.
  return `var(--mases-${value})`;
});

/* ────────────────────────────────────────────────────────────────────────
 * Icon lookup + reactive dev warnings
 * ──────────────────────────────────────────────────────────────────────── */

const IconComponent = computed(() => ICONS[props.name]);
const isMissing = computed(() => IconComponent.value === undefined);

if (import.meta.env.DEV) {
  watch(
    () => props.name,
    (name) => {
      if (!Object.prototype.hasOwnProperty.call(ICONS, name)) {
        // eslint-disable-next-line no-console
        console.warn(
          `[BaseIcon] unknown icon name "${String(name)}". A layout-` +
            `preserving placeholder will render. Register the icon via ` +
            `a Change Request if it is intended for the Phase 2 UI.`,
        );
      }
    },
    { immediate: true },
  );

  watch(
    () => props.color,
    (value) => {
      if (
        value !== undefined &&
        value !== '' &&
        !value.startsWith('--') &&
        !isCssColor(value)
      ) {
        // It resolved as a token; we cannot validate token existence
        // without the stylesheet, but we can log the assumption so
        // mistakes surface early.
        // eslint-disable-next-line no-console
        console.info(
          `[BaseIcon] color "${value}" is not a recognised CSS color; ` +
            `treating it as the MASES token "--mases-${value}".`,
        );
      }
    },
    { immediate: true },
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * Inline style — token-first with px fallback, so the primitive is
 * correct even when the token stylesheet is absent.
 * ──────────────────────────────────────────────────────────────────────── */

const inlineStyle = computed<Record<string, string>>(() => ({
  color: resolvedColor.value,
  width:  `var(${sizeSpec.value.token}, ${fallbackPx.value}px)`,
  height: `var(${sizeSpec.value.token}, ${fallbackPx.value}px)`,
}));

/* ────────────────────────────────────────────────────────────────────────
 * Accessibility
 * ──────────────────────────────────────────────────────────────────────── */

const isDecorative = computed<boolean>(() => props.ariaLabel === undefined);
</script>

<template>
  <!--
    Rendered icon.
    Attrs fall through to the root node in both branches; Vue treats
    v-if / v-else at the top level as a single root for that purpose.
  -->
  <component
    :is="IconComponent"
    v-if="!isMissing && IconComponent"
    :size="fallbackPx"
    :stroke-width="resolvedStrokeWidth"
    :style="inlineStyle"
    :class="['base-icon', `base-icon--${resolvedSizeKey}`]"
    :aria-hidden="isDecorative ? 'true' : undefined"
    :role="isDecorative ? undefined : 'img'"
    :aria-label="isDecorative ? undefined : ariaLabel"
    focusable="false"
    data-testid="base-icon-root"
    :data-icon-name="name"
    :data-size="resolvedSizeKey"
    :data-icon-resolved-size="fallbackPx"
  />

  <!--
    Placeholder branch — an unknown name never collapses the surrounding
    layout, and it stays visible in dev via a dashed outline so the bug
    is obvious without inspecting the DOM.
  -->
  <span
    v-else
    :style="inlineStyle"
    :class="['base-icon', 'base-icon--missing', `base-icon--${resolvedSizeKey}`]"
    :aria-hidden="isDecorative ? 'true' : undefined"
    :role="isDecorative ? undefined : 'img'"
    :aria-label="isDecorative ? undefined : ariaLabel"
    data-testid="base-icon-root"
    :data-icon-name="name"
    :data-size="resolvedSizeKey"
    :data-icon-resolved-size="fallbackPx"
    data-icon-missing="true"
  />
</template>

<style scoped>
/*
 * Minimal structural CSS only. Size, stroke weight, and color are set
 * via props (through Lucide's SVG attributes and the inline style).
 *
 * - display: inline-block + vertical-align: middle keeps the SVG on the
 *   text baseline; Lucide's SVGs otherwise default to `display: inline`
 *   in some rendering contexts, which produces a 1px baseline gap.
 * - flex-shrink: 0 prevents the icon from being compressed when placed
 *   inside a flex row next to text that expands — the single most
 *   common inline-SVG-in-flex gotcha.
 */
.base-icon {
  display: inline-block;
  flex-shrink: 0;
  vertical-align: middle;
}

/*
 * Missing-icon placeholder: same box, subtly highlighted in dev so the
 * mistake is visible without opening devtools. In production it is an
 * invisible box that preserves layout.
 */
.base-icon--missing {
  border-radius: 2px;
  background-color: currentColor;
  opacity: 0.08;
  outline: 1px dashed currentColor;
  outline-offset: -1px;
}

@media (prefers-reduced-motion: reduce) {
  /* Reserved for future animated states (e.g. loader spin). No-op today. */
  .base-icon {
    animation: none !important;
    transition: none !important;
  }
}
</style>