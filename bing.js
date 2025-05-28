// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.75
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
var default_search_words = ["从小培养爱国心", "冬天冷到-48℃的地方热成全国第一", "中国航母为何靠近日本？外交部回应", "稳就业各地在行动", "2025年新一线城市名单发布", "县城的万达广场王健林才舍不得卖", "151人贩卖个人信息获利4300万被抓获", "朱媛媛捐遗产和眼角膜？全是臆想编造", "泰国和柬埔寨士兵发生交火", "汪苏泷的拍照搭子是真蛇", "谁给赵今麦选的裙子", "重庆一车站爆破拆除前未疏散？假", "被吸至8000米高空当事人停飞6个月", "新国标：明年电池必须“刀枪不入”", "郑钦文晋级法网32强", "国务院安委会挂牌督办高密爆炸事故", "白宫：美国需要电工 而不是哈佛学生", "广西人的端午节“无扣”不成席", "中国对沙特等4国试行免签", "泽连斯基：俄军集结5万兵力准备进攻", "少女陪侍醉酒坠楼案终审 3人获刑", "黄晓明增重30斤演智力障碍人士", "美国停止发放任何学生签证 中方回应", "2025年全国高考报名人数1335万人", "女子走私2000多本淫秽漫画获刑3年半", "加沙数万难民疯抢食物 军队开火", "北师大回应官网教师简介用动漫头像", "国家疾控局：新冠疫情上升趋势减缓", "林允穿半透明纱裙身材好绝", "法国军方首次回应阵风战机疑被击落", "余华：现在写不出《活着》了", "新婚男子生殖手术后身亡系药物过敏", "一代人有一代人包粽子的办法", "冯小刚徐帆养女徐朵高中毕业", "旅客装了一箱230万美金入境被查获", "端午节看各地龙舟队水上狂飙", "毛宁发帖再次推介重庆洪崖洞", "C919航线网络覆盖我国16个城市", "外交部：中美经贸关系本质是互利共赢", "《在人间》赵丽颖张一山互扇巴掌", "金饰价格跌至1005元", "粽子海外订单爆了", "谁懂赵丽颖一开口的宿命感", "韩国大选前夕：华人面临反华情绪升级", "结婚4天离婚男子要回彩礼18万", "50岁林志玲红毯状态", "女子为遮阳戴荷叶化身“巨型绿蚊”", "选举时16人投出21票 国际乒联道歉", "美国佛州官宣金银为法定货币", "杨幂惠英红一起走红毯好养眼", "德国小伙勇闯佛山龙船飘移"]

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
