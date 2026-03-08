import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

export class EmailAlreadyExistsException extends ConflictException {
  constructor() {
    super({ code: 'EMAIL_EXISTS', message: 'Email này đã được đăng ký' });
  }
}

export class InvalidCredentialsException extends UnauthorizedException {
  constructor() {
    super({
      code: 'INVALID_CREDENTIALS',
      message: 'Email hoặc mật khẩu không đúng',
    });
  }
}

export class AccountDisabledException extends ForbiddenException {
  constructor() {
    super({ code: 'ACCOUNT_DISABLED', message: 'Tài khoản đã bị khoá' });
  }
}

export class InvalidRefreshTokenException extends UnauthorizedException {
  constructor() {
    super({
      code: 'INVALID_REFRESH_TOKEN',
      message: 'Refresh token không hợp lệ',
    });
  }
}

export class ResourceNotFoundException extends NotFoundException {
  constructor(resource: string) {
    super({ code: 'NOT_FOUND', message: `${resource} không tồn tại` });
  }
}

export class ForbiddenResourceException extends ForbiddenException {
  constructor() {
    super({
      code: 'FORBIDDEN',
      message: 'Bạn không có quyền thực hiện hành động này',
    });
  }
}

export class FreePlanLimitException extends BadRequestException {
  constructor(message: string) {
    super({ code: 'FREE_PLAN_LIMIT', message, upgradeUrl: '/pricing' });
  }
}

export class PremiumRequiredException extends ForbiddenException {
  constructor() {
    super({
      code: 'PREMIUM_REQUIRED',
      message: 'Tính năng này yêu cầu tài khoản Premium',
      upgradeUrl: '/pricing',
    });
  }
}

export class PaymentRequiredException extends ForbiddenException {
  constructor() {
    super({
      code: 'PAYMENT_REQUIRED',
      message: 'Tính năng này yêu cầu thanh toán',
      upgradeUrl: '/pricing',
    });
  }
}
