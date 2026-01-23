import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash2, ShoppingBag } from "lucide-react"
import { Rooster, roosterStatuses, healthStatuses } from "../../data/roosters"

interface RoosterTableProps {
  roosters: Rooster[]
  onViewDetails: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onBuyRooster: (rooster: Rooster) => void
}

export function RoosterTable({ roosters, onViewDetails, onEdit, onDelete, onBuyRooster }: RoosterTableProps) {
  const getStatusColor = (status: string) => {
    const statusConfig = roosterStatuses.find(s => s.value === status)
    return statusConfig?.color || "bg-gray-100 text-gray-800"
  }

  const getHealthColor = (health: string) => {
    const healthConfig = healthStatuses.find(h => h.value === health)
    return healthConfig?.color || "bg-gray-100 text-gray-800"
  }

  return (
    <Card className="border-[#3d6c58]/20">
      <CardHeader>
        <CardTitle className="text-[#1f3f2c]">Rooster Inventory</CardTitle>
        <CardDescription>Complete list of all roosters in your farm</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:hidden">
          {roosters.map((rooster) => (
            <div key={rooster.id} className="border border-[#3d6c58]/20 bg-white p-4" style={{ borderRadius: 0 }}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-[#1f3f2c] truncate">{rooster.id}</div>
                  <div className="text-sm text-[#4a6741] truncate">{rooster.breed}</div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onViewDetails(rooster.id)}>
                      <Eye className=" h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(rooster.id)}>
                      <Edit className=" h-4 w-4" />
                      Edit Profile
                    </DropdownMenuItem>
                    {rooster.status === 'Available' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-[#3d6c58]"
                          onClick={() => onBuyRooster(rooster)}
                        >
                          <ShoppingBag className=" h-4 w-4" />
                          Buy Rooster
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600"
                      onClick={() => onDelete(rooster.id)}
                    >
                      <Trash2 className=" h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-[#4a6741]">Age</div>
                  <div className="text-[#1f3f2c] font-medium truncate">{rooster.age}</div>
                </div>
                <div>
                  <div className="text-[#4a6741]">Weight</div>
                  <div className="text-[#1f3f2c] font-medium truncate">{rooster.weight}</div>
                </div>
                <div>
                  <div className="text-[#4a6741]">Status</div>
                  <Badge className={getStatusColor(rooster.status)}>
                    {rooster.status}
                  </Badge>
                </div>
                <div>
                  <div className="text-[#4a6741]">Price</div>
                  <div className="text-[#1f3f2c] font-semibold truncate">₱ {rooster.price}</div>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <Button
                  onClick={() => onViewDetails(rooster.id)}
                  className="w-full bg-[#3d6c58] hover:bg-[#4e816b]"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onEdit(rooster.id)}
                  className="w-full border-[#3d6c58]/20"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                {rooster.status === "Available" && (
                  <Button
                    onClick={() => onBuyRooster(rooster)}
                    className="w-full bg-[#3d6c58] hover:bg-[#4e816b]"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Buy Rooster
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="hidden sm:block w-full overflow-x-auto">
          <Table className="min-w-[720px]">
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Breed</TableHead>
                <TableHead className="hidden sm:table-cell">Age</TableHead>
                <TableHead className="hidden md:table-cell">Weight</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roosters.map((rooster) => (
                <TableRow key={rooster.id}>
                  <TableCell className="font-medium">{rooster.id}</TableCell>
                  <TableCell>{rooster.name || "--"}</TableCell>
                  <TableCell>{rooster.breed}</TableCell>
                  <TableCell className="hidden sm:table-cell">{rooster.age}</TableCell>
                  <TableCell className="hidden md:table-cell">{rooster.weight}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(rooster.status)}>
                      {rooster.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell font-semibold">₱ {rooster.price}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onViewDetails(rooster.id)}>
                          <Eye className=" h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(rooster.id)}>
                          <Edit className=" h-4 w-4" />
                          Edit Profile
                        </DropdownMenuItem>
                        {rooster.status === 'Available' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-[#3d6c58]"
                              onClick={() => onBuyRooster(rooster)}
                            >
                              <ShoppingBag className=" h-4 w-4" />
                              Buy Rooster
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => onDelete(rooster.id)}
                        >
                          <Trash2 className=" h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
