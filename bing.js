// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.255
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["习近平会见俄罗斯国家杜马主席", "中方回应“日本呼吁不参加九三阅兵”", "81岁网红外婆“册琳娜”遭遇车祸", "托举大国重器的火箭军来了", "人大开学典礼帆布袋拼错校名", "美团退款没到账？全民开始“查账”", "中方回应美威胁对华征收200%关税", "中方回应“特朗普希望尽快访华”", "网红称吃火鸡面烧穿胃 索赔7700万", "浙江一酒店内现千年古墓", "交警回应高速有人戴恐怖面具", "男子假冒“联合国外交官”被拆穿", "独居女生深夜开锁被索要2410元", "同机票在不同平台价差达2559元", "湖南黄金沉痛哀悼遇难者", "受贿3.16亿余元 刘星泰被判死缓", "猫咪误入动物园虎园被咬死", "伦敦飞北京一客机紧急迫降俄罗斯", "小伙因肥胖被分手三个月暴减几十斤", "江西上饶一医院住院楼起火", "白干7天被辞退 多人遇“无薪试岗”", "3人在猪粪池中毒溺亡 调查报告披露", "德国教师16年病假领百万工资", "多个奶茶品牌回应检出反式脂肪酸", "半年挣35亿 魔芋爽养肥了卫龙", "1800多年前古人就用上7格餐盘了", "寒武纪85后创始人身家超1500亿", "世界首例基因编辑猪肺成功移植人体", "女子怀疑57年前被抱错 寻亲生父母", "中国学生在瑞典拍敏感设施标牌被抓", "海南省发改委副主任被冒充 官方声明", "50岁阿姨考上研究生 曾因意外致残", "摄影师拍到“蓝色喷流闪电”", "双胞胎高考同分考入山东大学同专业", "朝鲜：已做好准备应对任何事态", "30岁女子因输头孢过敏险毁容", "版权之争后 汪苏泷张碧晨首次同台", "“身首离断”患者已转入普通病房", "洛阳一高中被质疑以成绩分宿舍", "健身卡退费被扣35%费用? 法院这样判", "当你误入抗战现场", "特朗普盯上驻韩美军基地土地所有权", "盛夏“收官”之雨来了", "恶搞风文创把鲁迅形象做成臭豆腐", "中使馆：赴美留学生慎选休斯敦航线", "高速上有人戴恐怖面具吓过路车辆", "今晚油价下调 加满一箱油少花7元", "与白血病抗争9年 少年考上华科大", "门店客服被曝辱骂顾客？海底捞回应", "李在明称韩日历史问题已解决", "广东清远长隆白犀牛家族再添新丁"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
