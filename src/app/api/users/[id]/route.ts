import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { User } from '@/models/User';
import { calculateAge } from '@/lib/helpers';
import { FEATURE_KEYS, FeatureKey } from '@/lib/userFeatures';

// Notice: params must be awaited
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await context.params; // ✅ unwrap params

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await context.params;
    const body = await req.json();

    const setData: Record<string, unknown> = {};
    const unsetData: Record<string, unknown> = {};

    if (body.dob !== undefined) {
      const dob = body.dob ? new Date(body.dob) : null;
      setData.dob = dob;
      const calculatedAge = calculateAge(dob);
      if (calculatedAge !== null) {
        setData.age = calculatedAge;
      }
    }

    if (body.age !== undefined) {
      setData.age = body.age;
    }

    if (
      body.features &&
      typeof body.features === 'object' &&
      !Array.isArray(body.features)
    ) {
      for (const key of FEATURE_KEYS) {
        const value = (body.features as Partial<Record<FeatureKey, unknown>>)[key];
        if (value !== undefined) {
          setData[`features.${key}`] = Boolean(value);
        }
      }
      unsetData.financeFeaturesEnabled = 1;
    }

    // Backward compatibility for old payload shape
    if (body.financeFeaturesEnabled !== undefined) {
      setData['features.financeFeaturesEnabled'] = Boolean(
        body.financeFeaturesEnabled
      );
      unsetData.financeFeaturesEnabled = 1;
    }

    const updateQuery: Record<string, unknown> = {};
    if (Object.keys(setData).length > 0) {
      updateQuery.$set = setData;
    }
    if (Object.keys(unsetData).length > 0) {
      updateQuery.$unset = unsetData;
    }

    const updatedUser =
      Object.keys(updateQuery).length === 0
        ? await User.findById(id)
        : await User.findByIdAndUpdate(id, updateQuery, { new: true });

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
