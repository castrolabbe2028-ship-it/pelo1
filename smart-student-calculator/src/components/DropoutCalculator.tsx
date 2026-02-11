import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Badge,
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Icon,
  Input,
  Select,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  AlertTriangle,
  ShieldCheck,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  Zap,
} from 'lucide-react';

// --- Constants ---
const DROPOUT_RATE = 0.028;
const BASE_SUBSIDY = 120_000;
const IVE_MULTIPLIERS: Record<string, number> = { BAJO: 1.0, MEDIO: 1.2, ALTO: 1.5 };
const SOSTAINER_MULTIPLIERS: Record<string, number> = { MUNICIPAL: 1.0, SUBVENCIONADO: 1.1, PAGADO: 3.0 };

/* ---- i18n ---- */
type Lang = 'es' | 'en';
const i18n: Record<Lang, Record<string, string>> = {
  es: {
    badge: 'SMART STUDENT IMPACT LAB',
    badgeTasa: 'Tasa 2.8%',
    badgeSub: 'Subvención $120.000',
    headline: 'Cada alumno que pierdes tiene un costo invisible',
    subheadline: 'Calcula la pérdida financiera anual y la proyección a 3 años. Visualiza el retorno de invertir en SmartStudent.',
    inputTitle: 'Datos del establecimiento',
    enrollment: 'Matrícula total',
    sustainerType: 'Tipo de sostenedor',
    optMunicipal: 'Municipal',
    optSubvencionado: 'Particular Subvencionado',
    optPagado: 'Particular Pagado',
    iveLevel: 'Nivel IVE',
    optLow: 'Bajo (0-40%)',
    optMid: 'Medio (40-75%)',
    optHigh: 'Alto (75-100%)',
    tasaNote: 'Tasa nacional',
    tasaAdj: 'ajustada por IVE',
    atRisk: 'En riesgo',
    studentsYear: 'alumnos / año',
    annualLoss: 'Pérdida anual',
    subsidy: 'subvención',
    threeYears: '3 años',
    accumulated: 'acumulado',
    ssSavings: 'Ahorro con SS',
    potential: 'potencial',
    comparison: 'Comparación directa',
    comparisonSub: 'Inacción 3 años vs inversión SmartStudent',
    accLoss: 'Pérdida acumulada',
    ssInvestment: 'Inversión SmartStudent',
    returnRatio: 'Ratio de retorno',
    chartTitle: 'Pérdida vs inversión',
    chart3y: '3 años',
    chartLoss: 'Pérdida 3 años',
    chartInv: 'Inversión SS',
    chartAmount: 'Monto',
    ctaLabel: 'Acción inmediata',
    ctaText: 'Detener esta pérdida cuesta menos que recuperar 5 alumnos',
    ctaBtn: 'Detener Pérdida',
    navInicio: 'Inicio',
    navFeatures: 'Características',
    navRoles: 'Roles',
    navPlans: 'Planes',
    navDemo: 'Agendar Demo',
  },
  en: {
    badge: 'SMART STUDENT IMPACT LAB',
    badgeTasa: 'Rate 2.8%',
    badgeSub: 'Subsidy $120,000',
    headline: 'Every student you lose has an invisible cost',
    subheadline: 'Calculate annual financial loss and 3-year projection. Visualize the return on investing in SmartStudent.',
    inputTitle: 'Institution Data',
    enrollment: 'Total Enrollment',
    sustainerType: 'School Type',
    optMunicipal: 'Public',
    optSubvencionado: 'Subsidized Private',
    optPagado: 'Private',
    iveLevel: 'IVE Level',
    optLow: 'Low (0-40%)',
    optMid: 'Medium (40-75%)',
    optHigh: 'High (75-100%)',
    tasaNote: 'National rate',
    tasaAdj: 'adjusted by IVE',
    atRisk: 'At Risk',
    studentsYear: 'students / year',
    annualLoss: 'Annual Loss',
    subsidy: 'subsidy',
    threeYears: '3 Years',
    accumulated: 'accumulated',
    ssSavings: 'SS Savings',
    potential: 'potential',
    comparison: 'Direct Comparison',
    comparisonSub: '3-year inaction vs SmartStudent investment',
    accLoss: 'Accumulated Loss',
    ssInvestment: 'SmartStudent Investment',
    returnRatio: 'Return Ratio',
    chartTitle: 'Loss vs Investment',
    chart3y: '3 Years',
    chartLoss: '3-Year Loss',
    chartInv: 'SS Investment',
    chartAmount: 'Amount',
    ctaLabel: 'Immediate Action',
    ctaText: 'Stopping this loss costs less than recovering 5 students',
    ctaBtn: 'Stop Loss',
    navInicio: 'Home',
    navFeatures: 'Features',
    navRoles: 'Roles',
    navPlans: 'Plans',
    navDemo: 'Schedule Demo',
  },
};

/* ---- Theme hook ---- */
function useThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.body.setAttribute('data-theme', dark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);
  useEffect(() => {
    document.body.setAttribute('data-theme', 'light');
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);
  const toggle = useCallback(() => setDark((d) => !d), []);

  // Expose toggle to static navbar
  useEffect(() => {
    const root = document.getElementById('root');
    if (root) (root as any).__themeToggle = toggle;
  }, [toggle]);

  // Sync navbar icon with theme state
  useEffect(() => {
    const icon = document.getElementById('navbar-theme-icon');
    const navbar = document.getElementById('site-navbar');
    const logo = document.getElementById('navbar-logo-text');
    if (icon) {
      icon.className = dark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
      icon.style.color = dark ? '#fbbf24' : '#475569';
    }
    if (navbar) {
      navbar.style.background = dark ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.85)';
      navbar.style.borderColor = dark ? 'rgba(51,65,85,0.6)' : 'rgba(203,213,225,0.4)';
    }
    // Update nav link colors
    ['nav-inicio','nav-features','nav-roles','nav-plans'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.color = dark ? '#94a3b8' : '#475569';
    });
    if (logo) logo.style.color = dark ? '#e2e8f0' : '#0f172a';
    const themeBtn = document.getElementById('navbar-theme-toggle');
    if (themeBtn) {
      themeBtn.style.background = dark ? 'rgba(51,65,85,0.8)' : 'rgba(255,255,255,0.8)';
      themeBtn.style.borderColor = dark ? '#475569' : '#e2e8f0';
    }
    const langBtn = document.getElementById('navbar-lang-toggle');
    if (langBtn) {
      langBtn.style.background = dark ? '#334155' : 'white';
      langBtn.style.color = dark ? '#e2e8f0' : '#0f172a';
      langBtn.style.borderColor = dark ? '#475569' : '#e2e8f0';
    }
  }, [dark]);

  return { dark, toggle };
}

/* ---- Animated counter ---- */
function useAnimatedNumber(target: number, duration = 500) {
  const [display, setDisplay] = useState(target);
  const raf = useRef<number>(0);
  useEffect(() => {
    const start = display;
    const diff = target - start;
    if (diff === 0) return;
    const t0 = performance.now();
    const step = (now: number) => {
      const elapsed = now - t0;
      const p = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + diff * ease));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);
  return display;
}

/* ---- Mini card ---- */
const MiniCard: React.FC<{
  icon: React.ElementType;
  iconColor: string;
  label: string;
  value: string;
  sub?: string;
  dark: boolean;
}> = ({ icon, iconColor, label, value, sub, dark }) => (
  <Box bg={dark ? 'gray.800' : 'white'} border="1px solid" borderColor={dark ? 'gray.700' : 'gray.200'}
    rounded="xl" px={3} py={2} boxShadow={dark ? '0 4px 14px -6px rgba(0,0,0,0.4)' : '0 4px 14px -6px rgba(15,23,42,0.12)'}
    transition="background 0.3s, border-color 0.3s">
    <HStack spacing={1.5} mb={0.5}>
      <Icon as={icon} boxSize="12px" color={iconColor} />
      <Text fontSize="10px" color={dark ? 'gray.400' : 'gray.500'} textTransform="uppercase" fontWeight="600" letterSpacing="0.04em">
        {label}
      </Text>
    </HStack>
    <Text fontSize="md" fontWeight="800" lineHeight="1.2" color={dark ? 'gray.100' : 'gray.800'}>{value}</Text>
    {sub && <Text fontSize="10px" color={dark ? 'gray.500' : 'gray.400'} mt={0}>{sub}</Text>}
  </Box>
);

/* ---- Compare bar ---- */
const CompareBar: React.FC<{
  label: string; value: number; maxValue: number; color: string; format: (v: number) => string; dark: boolean;
}> = ({ label, value, maxValue, color, format, dark }) => {
  const pct = Math.min((value / maxValue) * 100, 100);
  return (
    <Box>
      <HStack justify="space-between" mb={0.5}>
        <Text fontSize="11px" color={dark ? 'gray.400' : 'gray.600'}>{label}</Text>
        <Text fontSize="11px" fontWeight="700" color={dark ? 'gray.200' : undefined}>{format(value)}</Text>
      </HStack>
      <Box bg={dark ? 'gray.700' : 'gray.100'} rounded="full" h="6px" overflow="hidden">
        <Box h="full" rounded="full" bg={color} w={`${pct}%`} transition="width 0.6s ease" />
      </Box>
    </Box>
  );
};

/* ================ MAIN COMPONENT ================ */
const DropoutCalculator: React.FC = () => {
  const { dark } = useThemeToggle();
  const [lang, setLang] = useState<Lang>('es');
  const t = useCallback((key: string) => i18n[lang][key] ?? key, [lang]);
  const [enrollment, setEnrollment] = useState<number>(800);
  const [sustainer, setSustainer] = useState<string>('SUBVENCIONADO');
  const [ive, setIve] = useState<string>('MEDIO');

  // Expose lang toggle to static navbar
  const langToggle = useCallback(() => setLang((l) => (l === 'es' ? 'en' : 'es')), []);
  useEffect(() => {
    const root = document.getElementById('root');
    if (root) (root as any).__langToggle = langToggle;
  }, [langToggle]);

  // Sync navbar with lang
  useEffect(() => {
    const btn = document.getElementById('navbar-lang-toggle');
    if (btn) btn.textContent = lang === 'es' ? 'ES' : 'EN';
    // Update nav link names
    const navMap: Record<string, string> = {
      'nav-inicio': t('navInicio'),
      'nav-features': t('navFeatures'),
      'nav-roles': t('navRoles'),
      'nav-plans': t('navPlans'),
      'nav-demo': t('navDemo'),
    };
    Object.entries(navMap).forEach(([id, text]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    });
  }, [lang, t]);

  // Card style shorthand
  const cardBg = dark ? 'gray.800' : 'white';
  const cardBorder = dark ? 'gray.700' : 'gray.200';
  const cardShadow = dark ? '0 4px 14px -6px rgba(0,0,0,0.4)' : '0 4px 14px -6px rgba(15,23,42,0.12)';
  const textPrimary = dark ? 'gray.100' : 'gray.800';
  const textSecondary = dark ? 'gray.400' : 'gray.500';
  const subtleBg = dark ? 'gray.700' : 'gray.50';

  const results = useMemo(() => {
    const iveFactor = IVE_MULTIPLIERS[ive] ?? 1;
    const sustainerFactor = SOSTAINER_MULTIPLIERS[sustainer] ?? 1;
    const monthlyIncome = BASE_SUBSIDY * iveFactor * (sustainer === 'PAGADO' ? sustainerFactor : 1);
    const studentsLost = Math.ceil(enrollment * DROPOUT_RATE);
    const monthlyLoss = studentsLost * monthlyIncome;
    const annualLoss = monthlyLoss * 12;
    const threeYearLoss = annualLoss * 3;
    const recoveryValue = 5 * monthlyIncome * 12;
    const smartStudentCost = recoveryValue * 0.6;
    const savings = threeYearLoss - smartStudentCost;
    return { studentsLost, annualLoss, threeYearLoss, smartStudentCost, savings };
  }, [enrollment, sustainer, ive]);

  const animLost = useAnimatedNumber(results.studentsLost);
  const animAnnual = useAnimatedNumber(results.annualLoss, 600);
  const animThree = useAnimatedNumber(results.threeYearLoss, 600);
  const animSavings = useAnimatedNumber(results.savings, 600);

  const chartData = [
    { name: t('chartLoss'), monto: results.threeYearLoss, color: '#f97316' },
    { name: t('chartInv'), monto: results.smartStudentCost, color: '#22c55e' },
  ];

  const fmt = (value: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);

  const ratio = (results.threeYearLoss / results.smartStudentCost).toFixed(1);

  return (
    <Box minH="100vh" display="flex" flexDirection="column"
      pt={{ base: 3, md: 4 }} pb={{ base: 1, md: 2 }} px={{ base: 3, md: 5 }}
      bg="transparent"
      color={dark ? '#e2e8f0' : '#0f172a'}
      transition="color 0.4s ease">
      <Box maxW="1280px" mx="auto" w="full">
        {/* ===== HEADER ===== */}
        <HStack justify="space-between" mb={1} flexWrap="wrap" align="center">
          <HStack spacing={2} flexWrap="wrap">
            <Badge colorScheme="blue" variant="subtle" px={2} py={0.5} borderRadius="full" fontSize="10px"
              letterSpacing="0.08em">
              {t('badge')}
            </Badge>
            <Badge colorScheme="orange" variant="subtle" fontSize="10px">{t('badgeTasa')}</Badge>
            <Badge colorScheme="green" variant="subtle" fontSize="10px">{t('badgeSub')}</Badge>
          </HStack>
        </HStack>

        <Heading as="h1" fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }} lineHeight="1.15" mb={1}
          bgGradient="linear(to-r, #0ea5e9, #22c55e, #f97316)" bgClip="text">
          {t('headline')}
        </Heading>
        <Text fontSize={{ base: '11px', md: '12px' }} color={textSecondary} mb={{ base: 2, md: 3 }} maxW="600px">
          {t('subheadline')}
        </Text>

        {/* ===== MAIN 3-COL GRID ===== */}
        <Box display={{ base: 'flex', md: 'grid' }} flexDirection="column"
          gridTemplateColumns={{ md: '1fr 1fr 1.5fr' }} gap={{ base: 3, md: 4 }}>

          {/* —— COL 1: Inputs —— */}
          <Box bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="xl" p={4}
            boxShadow={cardShadow} transition="background 0.3s, border-color 0.3s">
            <HStack spacing={2} mb={3}>
              <Box bg={dark ? 'orange.900' : 'orange.100'} p={1} rounded="md">
                <Icon as={AlertTriangle} boxSize="13px" color="orange.500" />
              </Box>
              <Text fontSize="13px" fontWeight="700" color={textPrimary}>{t('inputTitle')}</Text>
            </HStack>

            <VStack spacing={3} align="stretch">
              <FormControl>
                <FormLabel fontSize="12px" fontWeight="600" mb={1} color={textPrimary}>{t('enrollment')}</FormLabel>
                <Input type="number" value={enrollment} size="sm" rounded="lg"
                  bg={dark ? 'gray.700' : 'white'} borderColor={cardBorder} color={textPrimary}
                  onChange={(e) => setEnrollment(Number(e.target.value))} min={1} />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="12px" fontWeight="600" mb={1} color={textPrimary}>{t('sustainerType')}</FormLabel>
                <Select value={sustainer} size="sm" rounded="lg"
                  bg={dark ? 'gray.700' : 'white'} borderColor={cardBorder}
                  color={dark ? '#ffffff' : '#1e293b'}
                  iconColor={dark ? '#ffffff' : undefined}
                  sx={dark ? { color: '#ffffff !important', '& option': { bg: '#1e293b', color: '#ffffff' } } : {}}
                  onChange={(e) => setSustainer(e.target.value)}>
                  <option value="MUNICIPAL" style={{ background: dark ? '#1e293b' : '#fff', color: dark ? '#ffffff' : '#1e293b' }}>{t('optMunicipal')}</option>
                  <option value="SUBVENCIONADO" style={{ background: dark ? '#1e293b' : '#fff', color: dark ? '#ffffff' : '#1e293b' }}>{t('optSubvencionado')}</option>
                  <option value="PAGADO" style={{ background: dark ? '#1e293b' : '#fff', color: dark ? '#ffffff' : '#1e293b' }}>{t('optPagado')}</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="12px" fontWeight="600" mb={1} color={textPrimary}>{t('iveLevel')}</FormLabel>
                <Select value={ive} size="sm" rounded="lg"
                  bg={dark ? 'gray.700' : 'white'} borderColor={cardBorder}
                  color={dark ? '#ffffff' : '#1e293b'}
                  iconColor={dark ? '#ffffff' : undefined}
                  sx={dark ? { color: '#ffffff !important', '& option': { bg: '#1e293b', color: '#ffffff' } } : {}}
                  onChange={(e) => setIve(e.target.value)}>
                  <option value="BAJO" style={{ background: dark ? '#1e293b' : '#fff', color: dark ? '#ffffff' : '#1e293b' }}>{t('optLow')}</option>
                  <option value="MEDIO" style={{ background: dark ? '#1e293b' : '#fff', color: dark ? '#ffffff' : '#1e293b' }}>{t('optMid')}</option>
                  <option value="ALTO" style={{ background: dark ? '#1e293b' : '#fff', color: dark ? '#ffffff' : '#1e293b' }}>{t('optHigh')}</option>
                </Select>
              </FormControl>

              <HStack spacing={2} p={2.5} bg={dark ? 'rgba(249,115,22,0.2)' : 'orange.50'} rounded="lg"
                border="1px solid" borderColor={dark ? 'rgba(249,115,22,0.4)' : 'orange.100'}>
                <Icon as={TrendingDown} color={dark ? 'orange.300' : 'orange.400'} boxSize="14px" />
                <Text fontSize="11px" color={dark ? 'white' : 'gray.600'}>
                  {t('tasaNote')} <Badge colorScheme="orange" fontSize="10px">2.8%</Badge> {t('tasaAdj')}
                </Text>
              </HStack>
            </VStack>
          </Box>

          {/* —— COL 2: Stats + Comparison —— */}
          <VStack spacing={2} align="stretch">
            <SimpleGrid columns={2} spacing={2}>
              <MiniCard dark={dark} icon={Users} iconColor="orange.500" label={t('atRisk')}
                value={String(animLost)} sub={t('studentsYear')} />
              <MiniCard dark={dark} icon={DollarSign} iconColor="red.500" label={t('annualLoss')}
                value={fmt(animAnnual)} sub={t('subsidy')} />
              <MiniCard dark={dark} icon={Calendar} iconColor="green.500" label={t('threeYears')}
                value={fmt(animThree)} sub={t('accumulated')} />
              <MiniCard dark={dark} icon={Zap} iconColor="blue.400" label={t('ssSavings')}
                value={fmt(animSavings)} sub={t('potential')} />
            </SimpleGrid>

            {/* Comparison */}
            <Box bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="xl" px={3} py={3}
              boxShadow={cardShadow} flex="1" display="flex" flexDirection="column"
              transition="background 0.3s, border-color 0.3s">
              <Text fontSize="13px" fontWeight="700" mb={0.5} color={textPrimary}>{t('comparison')}</Text>
              <Text fontSize="10px" color={textSecondary} mb={2}>{t('comparisonSub')}</Text>
              <VStack spacing={2} align="stretch" flex="1" justify="center">
                <CompareBar dark={dark} label={t('accLoss')} value={results.threeYearLoss}
                  maxValue={results.threeYearLoss} color="#f97316" format={fmt} />
                <CompareBar dark={dark} label={t('ssInvestment')} value={results.smartStudentCost}
                  maxValue={results.threeYearLoss} color="#22c55e" format={fmt} />
              </VStack>
              <HStack mt={2} p={1.5} bg={subtleBg} rounded="md" justify="space-between">
                <Text fontSize="10px" color={textSecondary}>{t('returnRatio')}</Text>
                <Badge colorScheme="green" fontSize="sm" px={2}>{ratio}x</Badge>
              </HStack>
            </Box>
          </VStack>

          {/* —— COL 3: Chart —— */}
          <Box bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="xl" px={3} py={3}
            boxShadow={cardShadow} display="flex" flexDirection="column"
            transition="background 0.3s, border-color 0.3s">
            <HStack justify="space-between" mb={2}>
              <Text fontSize="13px" fontWeight="700" color={textPrimary}>{t('chartTitle')}</Text>
              <Badge colorScheme="blue" fontSize="10px">{t('chart3y')}</Badge>
            </HStack>
            <Box flex="1" minH="220px">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -8, bottom: 5 }}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: dark ? '#ffffff' : '#475569', fontWeight: dark ? 500 : 400 }}
                    axisLine={{ stroke: dark ? '#475569' : '#cbd5e1' }} 
                    tickLine={false} 
                  />
                  <YAxis 
                    tickFormatter={(v: number) => `$${(v / 1_000_000).toFixed(0)}M`}
                    tick={{ fontSize: 11, fill: dark ? '#ffffff' : '#475569', fontWeight: dark ? 500 : 400 }}
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <Tooltip formatter={(value) => [fmt(Number(value)), t('chartAmount')]}
                    contentStyle={{
                      background: dark ? '#1e293b' : 'white',
                      border: `1px solid ${dark ? '#475569' : '#e2e8f0'}`,
                      borderRadius: '8px', fontSize: '12px',
                      color: dark ? '#f8fafc' : '#0f172a',
                      boxShadow: dark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                    labelStyle={{ color: dark ? '#f8fafc' : '#0f172a', fontWeight: 600 }}
                    itemStyle={{ color: dark ? '#e2e8f0' : '#334155' }}
                    cursor={{ fill: dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.04)' }} />
                  <Bar dataKey="monto" radius={[10, 10, 0, 0]} barSize={90}>
                    {chartData.map((entry, index) => (
                      <Cell key={`c-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Box>

        {/* ===== CTA HORIZONTAL ===== */}
        <HStack rounded="xl" px={{ base: 3, md: 5 }} py={{ base: 2, md: 2.5 }} mt={3}
          bgGradient="linear(to-r, #0ea5e9, #22c55e)" color="white"
          align="center" justify="space-between" flexWrap="wrap" gap={2}>
          <Box>
            <Text fontSize="8px" textTransform="uppercase" letterSpacing="0.1em" opacity={0.85} mb={0.5}>
              {t('ctaLabel')}
            </Text>
            <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="700" lineHeight="1.3">
              {t('ctaText')}
            </Text>
          </Box>
          <Button as="a" href="/index.html#demo" size="sm" bg="white" color="gray.900" flexShrink={0}
            rightIcon={<Icon as={ShieldCheck} boxSize="14px" />}
            _hover={{ transform: 'translateY(-1px)', boxShadow: 'lg', bg: 'gray.50' }}
            px={8} minW="200px" fontSize="xs" fontWeight="700" rounded="lg">
            {t('ctaBtn')}
          </Button>
        </HStack>
      </Box>
    </Box>
  );
};

export default DropoutCalculator;
