import { useAppSelector } from '@/hooks/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Mail, User } from 'lucide-react'

export default function ProfileCard() {
    const { user } = useAppSelector((state) => state.auth)
    
  return (
    <Card className="w-full max-w-md mx-auto bg-gray-900 border-gray-800 text-gray-100">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user?.image_url} alt={user?.full_name} />
          <AvatarFallback className="bg-gray-700 text-gray-100">
            user?.full_name
          </AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-xl">{user?.full_name}</CardTitle>
          <Badge 
            variant="secondary" 
            className="mt-2 bg-gray-700 text-gray-200 capitalize"
          >
            {user?.role}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-gray-400" />
          <span className="text-gray-300">{user?.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-gray-400" />
          <span className="text-gray-300">ID: {user?.id}</span>
        </div>
      </CardContent>
    </Card>
  )
}
