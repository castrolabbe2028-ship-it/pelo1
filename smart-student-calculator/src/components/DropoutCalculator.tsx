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
  IconButton,
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
  Sun,
  Moon,
} from 'lucide-react';

// --- Constants ---
const DROPOUT_RATE = 0.028;
const BASE_SUBSIDY = 120_000;
const IVE_MULTIPLIERS: Record<string, number> = { BAJO: 1.0, MEDIO: 1.2, ALTO: 1.5 };
const SOSTAINER_MULTIPLIERS: Record<string, number> = { MUNICIPAL: 1.0, SUBVENCIONADO: 1.1, PAGADO: 3.0 };

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
  const { dark, toggle } = useThemeToggle();
  const [enrollment, setEnrollment] = useState<number>(800);
  const [sustainer, setSustainer] = useState<string>('SUBVENCIONADO');
  const [ive, setIve] = useState<string>('MEDIO');

  // Card style shorthand
  const cardBg = dark ? 'gray.800' : 'white';
  const cardBorder = dark ? 'gray.700' : 'gray.200';
  const cardShadow = dark ? '0 4px 14px -6px rgba(0,0,0,0.4)' : '0 4px 14px -6px rgba(15,23,42,0.12)';
  const textPrimary = dark ? 'gray.100' : 'gray.800';
  const textSecondary = dark ? 'gray.400' : 'gray.500';
  const textMuted = dark ? 'gray.500' : 'gray.600';
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
    { name: 'Pérdida 3 años', monto: results.threeYearLoss, color: '#f97316' },
    { name: 'Inversión SS', monto: results.smartStudentCost, color: '#22c55e' },
  ];

  const fmt = (value: number) =>
    new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);

  const ratio = (results.threeYearLoss / results.smartStudentCost).toFixed(1);

  return (
    <Box minH="100vh" display="flex" flexDirection="column" justifyContent="center"
      py={{ base: 2, md: 3 }} px={{ base: 3, md: 5 }}
      bg="transparent"
      color={dark ? '#e2e8f0' : '#0f172a'}
      transition="color 0.4s ease">
      <Box maxW="1280px" mx="auto" w="full">
        {/* ===== HEADER ===== */}
        <HStack justify="space-between" mb={1} flexWrap="wrap" align="center">
          <HStack spacing={2} flexWrap="wrap">
            <Badge colorScheme="blue" variant="subtle" px={2} py={0.5} borderRadius="full" fontSize="10px"
              letterSpacing="0.08em">
              SMART STUDENT IMPACT LAB
            </Badge>
            <Badge colorScheme="orange" variant="subtle" fontSize="10px">Tasa 2.8%</Badge>
            <Badge colorScheme="green" variant="subtle" fontSize="10px">Subvención $120.000</Badge>
          </HStack>
          <IconButton
            aria-label="Cambiar tema"
            icon={<Icon as={dark ? Sun : Moon} boxSize="20px" />}
            onClick={toggle}
            variant="solid"
            rounded="full"
            size="sm"
            bg={dark ? 'gray.700' : 'gray.100'}
            color={dark ? 'yellow.300' : 'gray.600'}
            border="1px solid"
            borderColor={dark ? 'gray.600' : 'gray.300'}
            _hover={{ bg: dark ? 'gray.600' : 'gray.200', transform: 'scale(1.1)' }}
          />
        </HStack>

        <Heading as="h1" fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }} lineHeight="1.15" mb={1}
          bgGradient="linear(to-r, #0ea5e9, #22c55e, #f97316)" bgClip="text">
          Cada alumno que pierdes tiene un costo invisible
        </Heading>
        <Text fontSize={{ base: '11px', md: '12px' }} color={textSecondary} mb={{ base: 2, md: 3 }} maxW="600px">
          Calcula la pérdida financiera anual y la proyección a 3 años. Visualiza el retorno de invertir en SmartStudent.
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
              <Text fontSize="13px" fontWeight="700" color={textPrimary}>Datos del establecimiento</Text>
            </HStack>

            <VStack spacing={3} align="stretch">
              <FormControl>
                <FormLabel fontSize="12px" fontWeight="600" mb={1} color={textPrimary}>Matrícula total</FormLabel>
                <Input type="number" value={enrollment} size="sm" rounded="lg"
                  bg={dark ? 'gray.700' : 'white'} borderColor={cardBorder} color={textPrimary}
                  onChange={(e) => setEnrollment(Number(e.target.value))} min={1} />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="12px" fontWeight="600" mb={1} color={textPrimary}>Tipo de sostenedor</FormLabel>
                <Select value={sustainer} size="sm" rounded="lg"
                  bg={dark ? 'gray.700' : 'white'} borderColor={cardBorder}
                  color={dark ? '#ffffff' : '#1e293b'}
                  iconColor={dark ? '#ffffff' : undefined}
                  sx={dark ? { color: '#ffffff !important', '& option': { bg: '#1e293b', color: '#ffffff' } } : {}}
                  onChange={(e) => setSustainer(e.target.value)}>
                  <option value="MUNICIPAL" style={{ background: dark ? '#1e293b' : '#fff', color: dark ? '#ffffff' : '#1e293b' }}>Municipal</option>
                  <option value="SUBVENCIONADO" style={{ background: dark ? '#1e293b' : '#fff', color: dark ? '#ffffff' : '#1e293b' }}>Particular Subvencionado</option>
                  <option value="PAGADO" style={{ background: dark ? '#1e293b' : '#fff', color: dark ? '#ffffff' : '#1e293b' }}>Particular Pagado</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel fontSize="12px" fontWeight="600" mb={1} color={textPrimary}>Nivel IVE</FormLabel>
                <Select value={ive} size="sm" rounded="lg"
                  bg={dark ? 'gray.700' : 'white'} borderColor={cardBorder}
                  color={dark ? '#ffffff' : '#1e293b'}
                  iconColor={dark ? '#ffffff' : undefined}
                  sx={dark ? { color: '#ffffff !important', '& option': { bg: '#1e293b', color: '#ffffff' } } : {}}
                  onChange={(e) => setIve(e.target.value)}>
                  <option value="BAJO" style={{ background: dark ? '#1e293b' : '#fff', color: dark ? '#ffffff' : '#1e293b' }}>Bajo (0-40%)</option>
                  <option value="MEDIO" style={{ background: dark ? '#1e293b' : '#fff', color: dark ? '#ffffff' : '#1e293b' }}>Medio (40-75%)</option>
                  <option value="ALTO" style={{ background: dark ? '#1e293b' : '#fff', color: dark ? '#ffffff' : '#1e293b' }}>Alto (75-100%)</option>
                </Select>
              </FormControl>

              <HStack spacing={2} p={2.5} bg={dark ? 'rgba(249,115,22,0.2)' : 'orange.50'} rounded="lg"
                border="1px solid" borderColor={dark ? 'rgba(249,115,22,0.4)' : 'orange.100'}>
                <Icon as={TrendingDown} color={dark ? 'orange.300' : 'orange.400'} boxSize="14px" />
                <Text fontSize="11px" color={dark ? 'white' : 'gray.600'}>
                  Tasa nacional <Badge colorScheme="orange" fontSize="10px">2.8%</Badge> ajustada por IVE
                </Text>
              </HStack>
            </VStack>
          </Box>

          {/* —— COL 2: Stats + Comparison —— */}
          <VStack spacing={2} align="stretch">
            <SimpleGrid columns={2} spacing={2}>
              <MiniCard dark={dark} icon={Users} iconColor="orange.500" label="En riesgo"
                value={String(animLost)} sub="alumnos / año" />
              <MiniCard dark={dark} icon={DollarSign} iconColor="red.500" label="Pérdida anual"
                value={fmt(animAnnual)} sub="subvención" />
              <MiniCard dark={dark} icon={Calendar} iconColor="green.500" label="3 años"
                value={fmt(animThree)} sub="acumulado" />
              <MiniCard dark={dark} icon={Zap} iconColor="blue.400" label="Ahorro con SS"
                value={fmt(animSavings)} sub="potencial" />
            </SimpleGrid>

            {/* Comparison */}
            <Box bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="xl" px={3} py={3}
              boxShadow={cardShadow} flex="1" display="flex" flexDirection="column"
              transition="background 0.3s, border-color 0.3s">
              <Text fontSize="13px" fontWeight="700" mb={0.5} color={textPrimary}>Comparación directa</Text>
              <Text fontSize="10px" color={textSecondary} mb={2}>Inacción 3 años vs inversión SmartStudent</Text>
              <VStack spacing={2} align="stretch" flex="1" justify="center">
                <CompareBar dark={dark} label="Pérdida acumulada" value={results.threeYearLoss}
                  maxValue={results.threeYearLoss} color="#f97316" format={fmt} />
                <CompareBar dark={dark} label="Inversión SmartStudent" value={results.smartStudentCost}
                  maxValue={results.threeYearLoss} color="#22c55e" format={fmt} />
              </VStack>
              <HStack mt={2} p={1.5} bg={subtleBg} rounded="md" justify="space-between">
                <Text fontSize="10px" color={textSecondary}>Ratio de retorno</Text>
                <Badge colorScheme="green" fontSize="sm" px={2}>{ratio}x</Badge>
              </HStack>
            </Box>
          </VStack>

          {/* —— COL 3: Chart —— */}
          <Box bg={cardBg} border="1px solid" borderColor={cardBorder} rounded="xl" px={3} py={3}
            boxShadow={cardShadow} display="flex" flexDirection="column"
            transition="background 0.3s, border-color 0.3s">
            <HStack justify="space-between" mb={2}>
              <Text fontSize="13px" fontWeight="700" color={textPrimary}>Pérdida vs inversión</Text>
              <Badge colorScheme="blue" fontSize="10px">3 años</Badge>
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
                  <Tooltip formatter={(value) => [fmt(Number(value)), 'Monto']}
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
        <Box rounded="xl" px={{ base: 5, md: 8 }} py={{ base: 4, md: 4 }} mt={4}
          bgGradient="linear(to-r, #0ea5e9, #22c55e)" color="white"
          display="flex" flexDirection={{ base: 'column', md: 'row' }}
          alignItems="center" justifyContent="space-between" gap={4}>
          <VStack align={{ base: 'center', md: 'flex-start' }} spacing={1}
            textAlign={{ base: 'center', md: 'left' }} flex="1">
            <Text fontSize="10px" textTransform="uppercase" letterSpacing="0.12em" opacity={0.85}>
              Acción inmediata
            </Text>
            <Heading as="h3" fontSize={{ base: 'sm', md: 'md', lg: 'lg' }} lineHeight="1.3">
              Detener esta pérdida cuesta menos que recuperar 5 alumnos
            </Heading>
            <Text fontSize="13px" opacity={0.9}>
              Recupera {fmt(results.savings)} en 3 años implementando SmartStudent hoy.
            </Text>
          </VStack>
          <Button as="a" href="#contacto" size="lg" bg="white" color="gray.900" flexShrink={0}
            rightIcon={<Icon as={ShieldCheck} boxSize="20px" />}
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl', bg: 'gray.50' }}
            px={14} py={7} fontSize="md" fontWeight="700" rounded="xl"
            minW={{ base: 'full', md: '440px' }} h="auto">
            Detener la pérdida con SmartStudent
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default DropoutCalculator;
