const fs = require('fs');
let code = fs.readFileSync('components/dashboard/comparacion-4v-tab.tsx', 'utf8');

code = code.replace(
  "const [isOpenTanqueB, setIsOpenTanqueB] = useState(false)",
  `const [isOpenTanqueB, setIsOpenTanqueB] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpenTanqueB(false)
      }
    }
    if (isOpenTanqueB) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpenTanqueB, setIsOpenTanqueB])`
);

fs.writeFileSync('components/dashboard/comparacion-4v-tab.tsx', code, 'utf8');
console.log('Added useEffect!');
