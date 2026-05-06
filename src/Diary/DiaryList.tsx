import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit'
import Tooltip from '@mui/material/Tooltip'
import { blue } from "@mui/material/colors"
import { moodList, sampleDiary, type DiaryEntryType } from "./Diary"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { useTheme } from "@mui/material/styles"
import { supabase } from "../supabaseClient"
import { user } from "../App"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import type { PostgrestError } from "@supabase/supabase-js"
import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';

function DiaryList() {
    const [diaryList, setDiaryList] = useState<DiaryEntryType[]>([])
    const [filter, setFilter] = useState('')
    const [filterMood, setFilterMood] = useState(-1)

    useEffect(() => {
        loadEntries()
    }, [user.email, filterMood])

    function loadEntries() {
        let query = supabase.from('entries').select()

        if (filter.trim()) {
            query = query.textSearch('search_vector', filter, { type: 'websearch' })
        }

        if (filterMood !== -1) {
            query = query.eq('mood', filterMood)
        }

        query
            .order('created_at', { ascending: false })
            .limit(20)
            .then(({ data, error }) => {
                processEntries(data, error)
            })
    }

    function processEntries(data: any[] | null, error: PostgrestError | null) {
        if (!error && data) {
            const entries = data.map(item => ({
                id: item.id,
                date: item.created_at ? new Date(item.created_at) : new Date(),
                title: item.title ?? '',
                mood: item.mood ?? 0,
                content: item.content ?? '',
                star: item.star ?? 1,
            }))
            setDiaryList(entries)
        } else {
            console.error("Supabase error:", error)
            setDiaryList(sampleDiary)
        }
    }

    function search() {
        loadEntries()
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            loadEntries()
            event.preventDefault()
        }
    }

    const moodListExtra = [
        {
            mood: -1,
            text: 'All',
            icon: <AlternateEmailIcon sx={{ color: '#0099ff', fontSize: 'inherit' }} />,
        }, 
        ...moodList
    ]

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel id="mood-label">Mood</InputLabel>
                    <Select
                        labelId="mood-label"
                        id="mood-select"
                        value={filterMood}
                        label="Mood"
                        onChange={(event) => setFilterMood(event.target.value as number)}
                    >
                        {moodListExtra.map((item, index) => (
                            <MenuItem value={item.mood} key={index}>
                                <Box component='span' sx={{ fontSize: '1.2em', display: 'flex', alignItems: 'center' }}>
                                    {item.icon}
                                    <span style={{ paddingLeft: '0.7em' }}>{item.text}</span>
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    id="filter"
                    label="Search Content"
                    variant="outlined"
                    size="small"
                    value={filter}
                    onChange={event => setFilter(event.target.value)}
                    onKeyDown={handleKeyDown}
                    sx={{ flexGrow: 1, minWidth: '200px' }}
                />
                
                <Button variant="contained" onClick={search}>
                    Search
                </Button>
            </Box>

            {diaryList.map((entry, index) => (
                <DiaryEntry entry={entry} id={index} key={entry.id || index} />
            ))}
        </Box>
    )
}

export function DiaryEntry(prop: { entry: DiaryEntryType, id: number, show?: boolean }) {
    const { entry, show } = prop
    const navigate = useNavigate()
    const [expand, setExpand] = useState(show)
    const theme = useTheme()

    function handleEdit(): void {
        navigate(`/diaryedit/${entry.id}`, { state: entry })
    }

    function processContent(text: string): string {
        // 1. Bold "Samson"
        const samRegex = /(Samson)/gi
        let processedText = text.replaceAll(samRegex, `<strong>$1</strong>`)

        // 2. Replace [lat, lng] with links
        const geoRegex = /\[(-?\d+\.?\d*),\s*(-?\d+\.?\d*)\]/g
        processedText = processedText.replace(geoRegex, (match, lat, lng) => {
            return `<a href="/map/${lat},${lng}" style="color: ${theme.palette.primary.main}; text-decoration: underline; font-weight: bold;">${match}</a>`;
        });

        return processedText
    }

    return (
        <Paper elevation={1} sx={{
            display: 'flex',
            p: 1,
            m: 1,
            backgroundColor: blue[theme.palette.mode === 'dark' ? 800 : 100],
        }}>
            <Typography sx={{ fontSize: '48px', display: 'flex', alignItems: 'center' }}>
                {moodList[entry.mood]?.icon || '❓'}
            </Typography>
            
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                pl: 2,
            }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {entry.date.toDateString()}
                </Typography>
                <Typography 
                    variant="h6" 
                    onClick={() => setExpand(!expand)} 
                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                >
                    {entry.title || "Untitled Entry"}
                </Typography>
                {expand && (
                    <Typography component="div" sx={{ mt: 1 }}>
                        <div 
                            onClick={(e) => {
                                const target = e.target as HTMLElement;
                                if (target.tagName === 'A') {
                                    e.preventDefault();
                                    const href = target.getAttribute('href');
                                    if (href) navigate(href);
                                }
                            }}
                            dangerouslySetInnerHTML={{ __html: processContent(entry.content) }}
                        ></div>
                    </Typography>
                )}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <Typography sx={{ fontSize: '20px', color: '#cc9d02' }}>
                    {"★".repeat(entry.star)}
                </Typography>
                <Tooltip title="Edit">
                    <IconButton aria-label="edit" onClick={handleEdit}>
                        <EditIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        </Paper>
    )
}

export default DiaryList;