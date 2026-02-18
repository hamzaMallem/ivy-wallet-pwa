import { cn } from '@/lib/utils';

const COLORS = [
  { name: 'Purple', value: 0x5c3df5 },
  { name: 'Green', value: 0x12b880 },
  { name: 'Blue', value: 0x3193f5 },
  { name: 'Red', value: 0xf53d3d },
  { name: 'Orange', value: 0xf57a3d },
  { name: 'Yellow', value: 0xf5d018 },
  { name: 'Pink', value: 0xf53d99 },
  { name: 'Light Purple', value: 0x9987f5 },
  { name: 'Light Green', value: 0x5ae0b4 },
  { name: 'Light Blue', value: 0x87bef5 },
  { name: 'Dark Gray', value: 0x303033 },
  { name: 'Gray', value: 0x74747a },
];

export function ColorPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {COLORS.map((color) => (
        <button
          key={color.value}
          type="button"
          onClick={() => onChange(color.value)}
          className={cn(
            'h-8 w-8 rounded-full transition-transform hover:scale-110',
            value === color.value && 'ring-2 ring-on-background ring-offset-2 ring-offset-surface'
          )}
          style={{ backgroundColor: `#${color.value.toString(16).padStart(6, '0')}` }}
          title={color.name}
        />
      ))}
    </div>
  );
}
