"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  ShoppingCart,
  FileText,
  Edit,
  Trash2,
} from "lucide-react";
import type { Supplier } from "@/lib/supplier-types";

interface SupplierViewDialogProps {
  supplier: Supplier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SupplierViewDialog({
  supplier,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: SupplierViewDialogProps) {
  if (!supplier) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#1f3f2c]">
            {supplier.name}
          </DialogTitle>
          <DialogDescription>Supplier Details</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Contact Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-[#1f3f2c] flex items-center gap-2">
              <User className="h-4 w-4" />
              Contact Information
            </h3>
            <div className="grid gap-3 pl-6">
              {supplier.contactPerson && (
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-[#4a6741] mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Contact Person</p>
                    <p className="text-sm font-medium">{supplier.contactPerson}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-[#4a6741] mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-sm font-medium">{supplier.phone}</p>
                </div>
              </div>
              {supplier.email && (
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-[#4a6741] mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-sm font-medium">{supplier.email}</p>
                  </div>
                </div>
              )}
              {supplier.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-[#4a6741] mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-sm font-medium">{supplier.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Statistics */}
          <div className="space-y-3">
            <h3 className="font-semibold text-[#1f3f2c]">Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Package className="h-5 w-5 text-[#3d6c58]" />
                <div>
                  <p className="text-sm text-gray-500">Items Supplied</p>
                  <p className="text-lg font-semibold text-[#1f3f2c]">
                    {supplier.itemsSupplied}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-[#3d6c58]" />
                <div>
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-lg font-semibold text-[#1f3f2c]">
                    {supplier.totalOrders}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {supplier.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold text-[#1f3f2c] flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notes
                </h3>
                <p className="text-sm text-gray-600 pl-6">{supplier.notes}</p>
              </div>
            </>
          )}

          <Separator />

          {/* Metadata */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>
              Created:{" "}
              {new Date(supplier.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <p>
              Last Updated:{" "}
              {new Date(supplier.updatedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => {
              onDelete(supplier.id);
              onOpenChange(false);
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <div className="flex gap-2 flex-1 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-none"
            >
              Close
            </Button>
            <Button
              className="bg-[#3d6c58] hover:bg-[#4e816b] flex-1 sm:flex-none"
              onClick={() => {
                onEdit(supplier.id);
                onOpenChange(false);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
